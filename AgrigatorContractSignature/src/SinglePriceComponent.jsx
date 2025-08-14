// SinglePriceComponent.jsx
// React component to connect with MetaMask, sign EIP-712 for SinglePriceAggregator, and submit the update

import React, { useState } from 'react';
import { ethers } from 'ethers';

// Minimal ABI for SinglePriceAggregator
const ABI = [
  // getPrice
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getPrice',
    outputs: [
      { name: 'price', type: 'uint128' },
      { name: 'lastUpdated', type: 'uint64' },
      { name: 'decimals', type: 'uint8' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // updatePriceSigned
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'price', type: 'uint128' },
      { name: 'decimals', type: 'uint8' },
      { name: 'validUntil', type: 'uint64' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'updatePriceSigned',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const SinglePriceComponent = () => {
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signature, setSignature] = useState('');
  const [signedValidUntil, setSignedValidUntil] = useState(null);
  const [signedNonce, setSignedNonce] = useState(null);
  const [signedPriceInt, setSignedPriceInt] = useState(null);
  const [signedDecimals, setSignedDecimals] = useState(null);

  const [contractAddress, setContractAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [priceInput, setPriceInput] = useState(''); // human-readable, e.g., 1234.56
  const [decimals, setDecimals] = useState(8); // on-chain price decimals
  const [validForSec, setValidForSec] = useState(60);
  const [nonceHex, setNonceHex] = useState('');

  const [onchainPrice, setOnchainPrice] = useState('');
  const [onchainLast, setOnchainLast] = useState('');
  const [onchainDecimals, setOnchainDecimals] = useState('');

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setStatus('MetaMask is not installed');
      return;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      setConnected(true);
      setStatus('Connected');
    } catch (e) {
      setStatus(`Connection error: ${e.message || e}`);
    }
  };

  const randomNonce = () => {
    const bytes = ethers.randomBytes(32);
    const hex = ethers.hexlify(bytes);
    setNonceHex(hex);
  };

  const signUpdate = async () => {
    try {
      if (!signer) throw new Error('Connect wallet first');
      if (!contractAddress || !tokenAddress) throw new Error('Set contract and token addresses');
      if (!priceInput) throw new Error('Enter a price');

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Scale price to integer with provided decimals
      const priceInt = ethers.parseUnits(priceInput, decimals);
      const maxUint128 = (1n << 128n) - 1n;
      if (priceInt < 0n || priceInt > maxUint128) {
        throw new Error('price exceeds uint128 bounds with given decimals');
      }

      const validUntil = BigInt(Math.floor(Date.now() / 1000) + Number(validForSec));
      const nonce = nonceHex && nonceHex.startsWith('0x') ? BigInt(nonceHex) : BigInt(ethers.hexlify(ethers.randomBytes(32)));
      if (!nonceHex) setNonceHex(ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(nonce), 32)));

      const domain = {
        name: 'SinglePriceAggregator',
        version: '1',
        chainId,
        verifyingContract: contractAddress
      };

      console.log('chainId', chainId);
      console.log('verifyingContract', contractAddress);
      
      const types = {
        PriceSingle: [
          { name: 'token', type: 'address' },
          { name: 'price', type: 'uint128' },
          { name: 'decimals', type: 'uint8' },
          { name: 'validUntil', type: 'uint64' },
          { name: 'nonce', type: 'uint256' }
        ]
      };
      const message = {
        token: tokenAddress,
        price: priceInt,
        decimals,
        validUntil,
        nonce
      };

      console.log('contractAddress', contractAddress);
      console.log('tokenAddress', tokenAddress);
      console.log('priceInput', priceInput);
      console.log('decimals', decimals);
      console.log('validUntil', validUntil);
      console.log('nonce', nonce);
      

      const sig = await signer.signTypedData(domain, types, message);

      console.log('sig', sig);

      setSignature(sig);
      setSignedValidUntil(validUntil);
      setSignedNonce(nonce);
      setSignedPriceInt(priceInt);
      setSignedDecimals(decimals);
      setStatus('Signed successfully');
    } catch (e) {
      setStatus(`Sign error: ${e.message || e}`);
    }
  };

  const sendUpdate = async () => {
    try {
      if (!signature) throw new Error('Sign first');
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (signedValidUntil == null || signedNonce == null || signedPriceInt == null || signedDecimals == null) {
        throw new Error('Missing signed data. Please sign again.');
      }

      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.updatePriceSigned(
        tokenAddress,
        signedPriceInt,
        signedDecimals,
        signedValidUntil,
        signedNonce,
        signature
      );
      setStatus(`Tx sent: ${tx.hash}`);
      const rec = await tx.wait();
      setStatus(`Tx confirmed in block ${rec.blockNumber}`);
    } catch (e) {
      setStatus(`Send error: ${e.message || e}`);
    }
  };

  const readOnchainPrice = async () => {
    try {
      if (!contractAddress || !tokenAddress) throw new Error('Set contract and token addresses');
      const readProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ABI, readProvider);
      const [p, t, d] = await contract.getPrice(tokenAddress);
      setOnchainPrice(p.toString());
      setOnchainLast(Number(t).toString());
      setOnchainDecimals(Number(d).toString());
      setStatus('Read on-chain price');
    } catch (e) {
      setStatus(`Read error: ${e.message || e}`);
    }
  };

  return (
    <div style={{ maxWidth: 520, display: 'grid', gap: 8 }}>
      <h3>SinglePriceAggregator: EIP-712 Signed Update</h3>

      <button onClick={connectMetaMask} disabled={connected}>
        {connected ? 'Connected' : 'Connect MetaMask'}
      </button>

      <label>
        Contract Address
        <input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="0x..." />
      </label>
      <label>
        Token Address
        <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="0x..." />
      </label>
      <label>
        Price (human)
        <input value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="1234.56" />
      </label>
      <label>
        Price Decimals
        <input type="number" value={decimals} onChange={(e) => setDecimals(Number(e.target.value || 0))} />
      </label>
      <label>
        Valid For (seconds)
        <input type="number" value={validForSec} onChange={(e) => setValidForSec(Number(e.target.value || 0))} />
      </label>
      <label>
        Nonce (hex 32 bytes, optional)
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={nonceHex} onChange={(e) => setNonceHex(e.target.value)} placeholder="0x... (optional)" />
          <button type="button" onClick={randomNonce}>Random</button>
        </div>
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={signUpdate} disabled={!connected}>Sign</button>
        <button onClick={sendUpdate} disabled={!signature}>Send</button>
        <button onClick={readOnchainPrice}>Read</button>
      </div>

      <div>
        <div>Status: {status}</div>
        <div>Signature: {signature ? `${signature.slice(0, 10)}...${signature.slice(-8)}` : ''}</div>
        <div>On-chain price: {onchainPrice}</div>
        <div>On-chain lastUpdated: {onchainLast}</div>
        <div>On-chain decimals: {onchainDecimals}</div>
      </div>
    </div>
  );
};

export default SinglePriceComponent;



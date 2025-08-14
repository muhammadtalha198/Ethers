// BatchPriceComponent.jsx
// React component to sign and submit EIP-712 batch price updates for PriceAggregator

import React, { useState } from 'react';
import { ethers } from 'ethers';

// Minimal ABI for PriceAggregator
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
  // updatePricesSigned(tokens, prices, decimalsArray, names, validUntil, nonce, signature)
  {
    inputs: [
      { name: 'tokens', type: 'address[]' },
      { name: 'prices', type: 'uint128[]' },
      { name: 'decimalsArray', type: 'uint8[]' },
      { name: 'names', type: 'string[]' },
      { name: 'validUntil', type: 'uint64' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'updatePricesSigned',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // getRawPriceData returns (price,uint64 lastUpdated,uint8 decimals,string name)
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getRawPriceData',
    outputs: [
      {
        components: [
          { name: 'price', type: 'uint128' },
          { name: 'lastUpdated', type: 'uint64' },
          { name: 'decimals', type: 'uint8' },
          { name: 'name', type: 'string' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

const emptyRow = () => ({ token: '', price: '', decimals: 8, name: '' });

const BatchPriceComponent = () => {
  const [status, setStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const [contractAddress, setContractAddress] = useState('');
  const [rows, setRows] = useState([emptyRow()]);
  const [validForSec, setValidForSec] = useState(60);
  const [nonceHex, setNonceHex] = useState('');

  const [signature, setSignature] = useState('');
  const [signedTokens, setSignedTokens] = useState(null);
  const [signedPrices, setSignedPrices] = useState(null); // bigint[]
  const [signedDecimals, setSignedDecimals] = useState(null); // number[]
  const [signedNames, setSignedNames] = useState(null);
  const [signedValidUntil, setSignedValidUntil] = useState(null);
  const [signedNonce, setSignedNonce] = useState(null);

  const [readResults, setReadResults] = useState([]); // [{token, price, name, decimals}]

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

  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));
  const updateRow = (idx, key, val) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));

  const randomNonce = () => {
    const bytes = ethers.randomBytes(32);
    const hex = ethers.hexlify(bytes);
    setNonceHex(hex);
  };

  const signBatch = async () => {
    try {
      if (!signer) throw new Error('Connect wallet first');
      if (!contractAddress) throw new Error('Set contract address');
      const tokens = [];
      const priceBigs = [];
      const decs = [];
      const names = [];
      const seen = new Set();

      const readProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const readContract = new ethers.Contract(contractAddress, ABI, readProvider);
      const nowTs = Math.floor(Date.now() / 1000);

      for (const row of rows) {
        if (!row.token || !row.price) continue;
        const priceInt = ethers.parseUnits(row.price, Number(row.decimals || 0));
        const maxUint128 = (1n << 128n) - 1n;
        if (priceInt < 0n || priceInt > maxUint128) {
          throw new Error(`price exceeds uint128 for token ${row.token}`);
        }
        const addr = ethers.getAddress(row.token);
        if (seen.has(addr)) {
          continue; // skip duplicates
        }
        seen.add(addr);

        // Cooldown pre-check to avoid batch revert
        try {
          const [_, lastUpdated] = await readContract.getPrice(addr);
          if (Number(lastUpdated) !== 0 && nowTs - Number(lastUpdated) < 20) {
            continue; // skip under-cooldown token
          }
        } catch (_) {
          // ignore read errors; treat as new token
        }

        tokens.push(addr);
        priceBigs.push(priceInt);
        decs.push(Number(row.decimals || 0));
        names.push(row.name || '');
      }

      if (tokens.length === 0) throw new Error('No eligible rows to sign (duplicates or cooldown)');

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const validUntil = BigInt(Math.floor(Date.now() / 1000) + Number(validForSec));
      const nonce = nonceHex && nonceHex.startsWith('0x') ? BigInt(nonceHex) : BigInt(ethers.hexlify(ethers.randomBytes(32)));
      if (!nonceHex) setNonceHex(ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(nonce), 32)));

      // Compute hashes
      const coder = ethers.AbiCoder.defaultAbiCoder();
      const tokensHash = ethers.keccak256(coder.encode(['address[]'], [tokens]));
      const pricesHash = ethers.keccak256(coder.encode(['uint128[]'], [priceBigs]));
      const decimalsHash = ethers.keccak256(coder.encode(['uint8[]'], [decs]));
      const namesHash = ethers.keccak256(coder.encode(['string[]'], [names]));

      const domain = {
        name: 'PriceAggregator',
        version: '1',
        chainId,
        verifyingContract: contractAddress
      };
      const types = {
        PriceBatch: [
          { name: 'tokensHash', type: 'bytes32' },
          { name: 'pricesHash', type: 'bytes32' },
          { name: 'decimalsHash', type: 'bytes32' },
          { name: 'namesHash', type: 'bytes32' },
          { name: 'validUntil', type: 'uint64' },
          { name: 'nonce', type: 'uint256' }
        ]
      };
      const value = { tokensHash, pricesHash, decimalsHash, namesHash, validUntil, nonce };

      const sig = await signer.signTypedData(domain, types, value);
      setSignature(sig);
      setSignedTokens(tokens);
      setSignedPrices(priceBigs);
      setSignedDecimals(decs);
      setSignedNames(names);
      setSignedValidUntil(validUntil);
      setSignedNonce(nonce);
      setStatus('Batch signed successfully');
    } catch (e) {
      setStatus(`Sign error: ${e.message || e}`);
    }
  };

  const sendBatch = async () => {
    try {
      if (!signature) throw new Error('Sign first');
      if (!signedTokens || !signedPrices || !signedDecimals || !signedNames || signedValidUntil == null || signedNonce == null) {
        throw new Error('Missing signed data. Please sign again.');
      }
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.updatePricesSigned(
        signedTokens,
        signedPrices,
        signedDecimals,
        signedNames,
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

  const readAll = async () => {
    try {
      if (!contractAddress) throw new Error('Set contract address');
      const readProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ABI, readProvider);
      const out = [];
      for (const row of rows) {
        if (!row.token) continue;
        const data = await contract.getRawPriceData(row.token);
        const price = (data.price ?? data[0]).toString();
        const decimals = Number(data.decimals ?? data[2]).toString();
        const name = (data.name ?? data[3]) || '';
        out.push({ token: row.token, price, name, decimals });
      }
      setReadResults(out);
      setStatus('Fetched on-chain prices');
    } catch (e) {
      setStatus(`Read error: ${e.message || e}`);
    }
  };

  return (
    <div style={{ maxWidth: 720, display: 'grid', gap: 10 }}>
      <h3>PriceAggregator: EIP-712 Batch Update</h3>

      <button onClick={connectMetaMask} disabled={connected}>
        {connected ? 'Connected' : 'Connect MetaMask'}
      </button>

      <label>
        Contract Address
        <input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="0x..." />
      </label>

      <div style={{ border: '1px solid #ccc', padding: 10, borderRadius: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Tokens</strong>
          <button type="button" onClick={addRow}>+ Add</button>
        </div>
        {rows.map((row, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 110px 80px', gap: 8, marginTop: 8 }}>
            <input value={row.token} onChange={(e) => updateRow(idx, 'token', e.target.value)} placeholder="Token 0x..." />
            <input value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} placeholder="Token Name" />
            <input value={row.price} onChange={(e) => updateRow(idx, 'price', e.target.value)} placeholder="Price, e.g. 1234.56" />
            <input type="number" value={row.decimals} onChange={(e) => updateRow(idx, 'decimals', Number(e.target.value || 0))} placeholder="decimals" />
            <button type="button" onClick={() => removeRow(idx)}>Remove</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 8 }}>
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
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={signBatch} disabled={!connected}>Sign</button>
        <button onClick={sendBatch} disabled={!signature}>Send</button>
        <button onClick={readAll}>Read</button>
      </div>

      <div>
        <div>Status: {status}</div>
        <div>Signature: {signature ? `${signature.slice(0, 10)}...${signature.slice(-8)}` : ''}</div>
        {readResults.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <strong>On-chain:</strong>
            {readResults.map((r, i) => (
              <div key={i} style={{ fontFamily: 'monospace' }}>
                {r.token}: price={r.price} name={r.name} decimals={r.decimals}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchPriceComponent;



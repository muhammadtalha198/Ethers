// PermitComponent.js
import React, { useState } from "react";
import { ethers } from "ethers";

const PermitComponent = () => {
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signature, setSignature] = useState("");
  const [connected, setConnected] = useState(false);

  // Replace these with actual values
  const tokenAddress = "0x396Ce2Eed93b79AbB3241226E17Cc34136b7c492";
  const spenderAddress = "0xA33c5875BE1e3aFd5D72C5dF98D3469d95aC85B0";
  const amount = ethers.parseUnits("1.0", 18); // Adjust token amount
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1-hour deadline
  const chainId = 11155111; // Update to your chain ID

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        console.log("Connecteed");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        setProvider(newProvider);
        setSigner(newSigner);
        setConnected(true);
        setStatus("Connected to MetaMask");
        console.log("Connecteed");
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        setStatus("Error connecting to MetaMask");
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  // Sign and send the permit transaction
  const signPermit = async () => {
    try {
      const ownerAddress = await signer.getAddress();

      console.log("ownerAddress: ", ownerAddress);

      // Set up contract instance and get nonce
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function nonces(address owner) view returns (uint256)"],
        signer
      );

      // const nonce = await tokenContract.nonces(ownerAddress);
      const nonce = 0;
      console.log("nonce: ", nonce);
      // Define EIP-712 domain and types
      const domain = {
        name: "token", // Update with your token's name
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: ownerAddress,
        spender: spenderAddress,
        value: amount,
        nonce: nonce,
        deadline: deadline,
      };

      // Sign the permit
      const signedMessageSignature = await signer.signTypedData(
        domain,
        types,
        message
      );
      setSignature(signedMessageSignature); // Save the signature for later use
      setStatus("Message signed successfully.");

      console.log("signedMessageSignature: ", signedMessageSignature);
      console.log("signedMessageSignature: ", signature);

      const { v, r, s } = ethers.Signature.from(signedMessageSignature);

      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      console.error("Error signing permit:", error);
      setStatus("Error signing permit: " + error.message);
    }
  };

  // // Send the permit transaction
  const sendPermit = async () => {
    console.log("signedMessageSignature: ", signature);

    if (!signature) {
      setStatus("You need to sign the permit first!");
      return;
    }

    try {
      const ownerAddress = await signer.getAddress();

      console.log("ownerAddress: ", ownerAddress);

      // Set up contract instance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
        ],
        signer
      );

      // Split the signature
      const { v, r, s } = ethers.Signature.from(signature);

      // Send the permit transaction
      const tx = await tokenContract.permit(
        ownerAddress,
        spenderAddress,
        amount,
        deadline,
        v,
        r,
        s
      );
      setStatus("Transaction sent: " + tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      setStatus("Transaction confirmed: " + receipt.transactionHash);
    } catch (error) {
      console.error("Error sending permit transaction:", error);
      setStatus("Error sending permit: " + error.message);
    }
  };

  return (
    <div>
      <h1>ERC20 Permit with MetaMask</h1>
      <button onClick={connectMetaMask} disabled={connected}>
        {connected ? "Connected" : "Connect to MetaMask"}
      </button>
      <br />

      <button onClick={signPermit} disabled={!connected}>
        Sign Permit
      </button>
      <br />
      <button onClick={sendPermit} disabled={!signature}>
        Send Permit
      </button>
      <p>{status}</p>
    </div>
  );
};

export default PermitComponent;

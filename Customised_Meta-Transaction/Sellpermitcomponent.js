// SellPermitComponent.js
import React, { useState } from "react";
import { ethers } from "ethers";

const SellPermitComponent = () => {
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signature, setSignature] = useState("");
  const [connected, setConnected] = useState(false);

  // Replace these with actual values
  const WagerAddress = "0x26A7410e6D4841073C23C1c4D7d91443a8dce1A9";
  const spenderAddress = "0xA33c5875BE1e3aFd5D72C5dF98D3469d95aC85B0";
  const amount = 10000000; // Adjust token amount
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1-hour deadline
  // const chainId = 11155111; // Update to your chain ID
  const chainId = 80002; // Update to your chain ID
  const betOn = 0;
  const noOfShares = 12000000;
  const price = 6000000;
  const sellOf = 0;
  const value = 14000000;

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

  // // Sign and send the permit transaction
  const BetPermit = async () => {
    try {
      const ownerAddress = await signer.getAddress();
      console.log("ownerAddress: ", ownerAddress);

      // Set up contract instance and get nonce
      const WagerContract = new ethers.Contract(
        WagerAddress,
        [
          "function nonces(address owner) view returns (uint256)",
          "function name() public view returns (string memory)",
        ],
        signer
      );

      // const name = await WagerContract.name();
      // console.log("name : ", name);

      const nonce = await WagerContract.nonces(ownerAddress);
      console.log("nonce: ", Number(nonce));

      // Define EIP-712 domain and types
      const domain = {
        // name: name, // Update with your token's name
        name: "Wager", // Update with your token's name
        version: "1",
        chainId: chainId,
        verifyingContract: WagerAddress,
      };

      const types = {
        BetPermit: [
          { name: "user", type: "address" },
          { name: "owner", type: "address" },
          { name: "value", type: "uint256" },
          { name: "betOn", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        user: ownerAddress,
        owner: spenderAddress,
        value: amount,
        betOn: betOn,
        nonce: Number(nonce),
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

      const { v, r, s } = ethers.Signature.from(signedMessageSignature);

      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      console.error("Error signing permit:", error);
      setStatus("Error signing permit: " + error.message);
    }
  };

  // // Sign and send the permit transaction
  const SellPermit = async () => {
    try {
      const ownerAddress = await signer.getAddress();
      console.log("ownerAddress: ", ownerAddress);

      // Set up contract instance and get nonce
      const WagerContract = new ethers.Contract(
        WagerAddress,
        [
          "function nonces(address owner) view returns (uint256)",
          "function name() public view returns (string memory)",
        ],
        signer
      );

      const nonce = await WagerContract.nonces(ownerAddress);
      console.log("nonce: ", Number(nonce));

      const domain = {
        name: "Wager", // Update with your contract name
        version: "1",
        chainId: chainId,
        verifyingContract: WagerAddress,
      };

      const types = {
        SellPermit: [
          { name: "user", type: "address" },
          { name: "owner", type: "address" },
          { name: "value", type: "uint256" },
          { name: "betOn", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        user: ownerAddress,
        owner: spenderAddress,
        value: amount,
        betOn: betOn,
        nonce: Number(nonce),
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

      const { v, r, s } = ethers.Signature.from(signedMessageSignature);

      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      console.error("Error signing permit:", error);
      setStatus("Error signing permit: " + error.message);
    }
  };

  const SellPermitOr = async () => {
    
    try {
      const ownerAddress = await signer.getAddress();
      console.log("ownerAddress: ", ownerAddress);

      const WagerContract = new ethers.Contract(
        WagerAddress,
        [
          "function nonces(address owner) view returns (uint256)",
          "function name() public view returns (string memory)",
        ],
        signer
      );

      const nonce = await WagerContract.nonces(ownerAddress);
      console.log("nonce: ", Number(nonce));

      const domain = {
        name: "Wager", // Update with your token's name
        version: "1",
        chainId: chainId,
        verifyingContract: WagerAddress,
      };

      const types = {
        SellPermitOr: [
          { name: "user", type: "address" },
          { name: "owner", type: "address" },
          { name: "shares", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        user: ownerAddress,
        owner: spenderAddress,
        shares: noOfShares,
        price: price,
        nonce: Number(nonce),
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

      const { v, r, s } = ethers.Signature.from(signedMessageSignature);

      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);

    } catch (error) {
      console.error("Error signing permit:", error);
      setStatus("Error signing permit: " + error.message);
    }
  };

  // // Sign and send the permit transaction
  const SellPermitSix = async () => {
    
    try {
      const ownerAddress = await signer.getAddress();
      console.log("ownerAddress: ", ownerAddress);

      const WagerContract = new ethers.Contract(
        WagerAddress,
        [
          "function nonces(address owner) view returns (uint256)",
          "function name() public view returns (string memory)",
        ],
        signer
      );


      const nonce = await WagerContract.nonces(ownerAddress);
      console.log("nonce: ", Number(nonce));

      const domain = {
        name: "Wager", // Update with your token's name
        version: "1",
        chainId: chainId,
        verifyingContract: WagerAddress,
      };

      const types = {
        SellPermitOr: [
          { name: "user", type: "address" },
          { name: "owner", type: "address" },
          { name: "shares", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "bet", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        user: ownerAddress,
        owner: spenderAddress,
        shares: noOfShares,
        price: price,
        nonce: Number(nonce),
        bet: sellOf,
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

      const { v, r, s } = ethers.Signature.from(signedMessageSignature);

      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      
      console.error("Error signing permit:", error);
      setStatus("Error signing permit: " + error.message);
    }
  };
  

  return (
    <div>
      <h1> Sell Permit with MetaMask</h1>
      <button onClick={connectMetaMask} disabled={connected}>
        {connected ? "Connected" : "Connect to MetaMask"}
      </button>
      <br />

      <button onClick={BetPermit} disabled={!connected}>
        Sell BetPermit
      </button>
      <br />
      <button onClick={SellPermit} disabled={!connected}>
        Sell SellPermit
      </button>
      <br />
      <button onClick={SellPermitOr} disabled={!connected}>
        Sell SellPermitOr
      </button>
      <br />
      <button onClick={SellPermitSix} disabled={!connected}>
        Sell SellPermitSix
      </button>
      <br />
      {/* <button
        onClick={signPermit1}
        // disabled={!signature}
      >
        Siign Permit1
      </button> */}
      <p>{status}</p>
    </div>
  );
};

export default SellPermitComponent;


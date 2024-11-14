import React, { useState } from "react";
import { ethers } from "ethers";

const PermitComponent = () => {
  const [status, setStatus] = useState("");
  const [signature, setSignature] = useState(null);
  const [v, setV] = useState(null);
  const [r, setR] = useState(null);
  const [s, setS] = useState(null);

  // Function to split the signature into v, r, s using ethers.Signature.from in v6.x
  const splitSignature = (signature) => {
    try {
      // Split the signature using ethers.Signature.from
      const { v, r, s } = ethers.Signature.from(signature);

      // Update state with the components
      setV(v);
      setR(r);
      setS(s);

      setStatus("Signature split successfully.");
      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      setStatus("Error splitting signature: " + error.message);
      console.error("Error splitting signature:", error);
    }
  };

  // Handle input change for the signature
  const handleSignatureInput = (event) => {
    setSignature(event.target.value);
  };

  return (
    <div>
      <h1>Signature Splitting with MetaMask</h1>
      <div>
        <label htmlFor="signature">Enter Signature:</label>
        <input
          id="signature"
          type="text"
          placeholder="0x..."
          value={signature || ""}
          onChange={handleSignatureInput}
        />
      </div>
      <br />
      <button onClick={() => splitSignature(signature)} disabled={!signature}>
        Split Signature
      </button>
      <br />
      <div>
        <p>Status: {status}</p>
        {v && (
          <div>
            <p>
              <strong>v:</strong> {v}
            </p>
            <p>
              <strong>r:</strong> {r}
            </p>
            <p>
              <strong>s:</strong> {s}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitComponent;
import React, { useState } from "react";
import { ethers } from "ethers";

const PermitComponent = () => {
  const [status, setStatus] = useState("");
  const [signature, setSignature] = useState(null);
  const [v, setV] = useState(null);
  const [r, setR] = useState(null);
  const [s, setS] = useState(null);

  // Function to split the signature into v, r, s using ethers.Signature.from in v6.x
  const splitSignature = (signature) => {
    try {
      // Split the signature using ethers.Signature.from
      const { v, r, s } = ethers.Signature.from(signature);

      // Update state with the components
      setV(v);
      setR(r);
      setS(s);

      setStatus("Signature split successfully.");
      console.log("v: ", v);
      console.log("r: ", r);
      console.log("s: ", s);
    } catch (error) {
      setStatus("Error splitting signature: " + error.message);
      console.error("Error splitting signature:", error);
    }
  };

  // Handle input change for the signature
  const handleSignatureInput = (event) => {
    setSignature(event.target.value);
  };

  return (
    <div>
      <h1>Signature Splitting with MetaMask</h1>
      <div>
        <label htmlFor="signature">Enter Signature:</label>
        <input
          id="signature"
          type="text"
          placeholder="0x..."
          value={signature || ""}
          onChange={handleSignatureInput}
        />
      </div>
      <br />
      <button onClick={() => splitSignature(signature)} disabled={!signature}>
        Split Signature
      </button>
      <br />
      <div>
        <p>Status: {status}</p>
        {v && (
          <div>
            <p>
              <strong>v:</strong> {v}
            </p>
            <p>
              <strong>r:</strong> {r}
            </p>
            <p>
              <strong>s:</strong> {s}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitComponent;

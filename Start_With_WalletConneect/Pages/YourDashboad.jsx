// src/YourDashboard.js
import React, { useState } from "react";
import "./Dashboard.css";

const YourDashboard = ({ setCurrentPage }) => {
  const [price, setPrice] = useState("");
  const [submittedPrice, setSubmittedPrice] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedPrice(price);
    setPrice("");
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Your Dashboard</h1>
        <button className="wallet-button">Connect Wallet</button>
      </header>
      <div className="content">
        <aside className="sidebar">
          <button onClick={() => setCurrentPage("main")}>Main Dashboard</button>
          <button onClick={() => setCurrentPage("your")}>Your Dashboard</button>
          <button onClick={() => setCurrentPage("protocol")}>
            Protocol Matrices
          </button>
        </aside>
        <main className="main-content">
          <div className="price-box">Shoe 1: $80</div>
          <div className="price-box">Shoe 2: $120</div>
          <div className="price-box">Shoe 3: $150</div>
          <div className="price-box">Shoe 4: $200</div>
          <div className="price-box">Shoe 5: $250</div>
          {submittedPrice && (
            <div className="price-box">Submitted Price: ${submittedPrice}</div>
          )}
          <form className="price-form" onSubmit={handleSubmit}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
            <button type="submit">Submit</button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default YourDashboard;

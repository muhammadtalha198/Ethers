import React, { useState, useEffect } from "react";
// src/Dashboard.js

import "./Dashboard.css";
import ConnectButton from "../WalletConnectEthers/ConnectButton";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { PoolContrractAbi } from "../Components/PoolContrractAbi";
import { UsdcTokenAbi } from "../Components/UsdcTokenAbi";

const USDTAddress = "0xef7891528adacB9c39C0e2547127F5Ef896F19dD";
const PoolAddress = "0x7bBE3e0d85926eb91b7f07ddB1Be55250d9AD4b1";

const Dashboard = ({ setCurrentPage }) => {
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [tusryPoolAmount, setTusryPoolAmount] = useState(0);
  const [ownrPoolAmount, setOwnrPoolAmount] = useState(0);
  const [totalPoolCap, setTotalPoolCap] = useState("0");
  const [tsryPoolPrcntg, setTsryPoolPrcntg] = useState("0");
  const [ownrPoolprcntg, setOwnrPoolprcntg] = useState(0);
  const [balance, setBalance] = useState("0");
  const [tokenbalance, setTookenBalance] = useState("0");

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected) throw Error("User disconnected");

      const ethersProvider = new BrowserProvider(walletProvider);

      const balance = await ethersProvider.getBalance(address);
      const balanceInEther = formatUnits(balance);
      setBalance(balanceInEther);

      // The Contract object
      const signer = await ethersProvider.getSigner();

      const USDTContract = new Contract(USDTAddress, UsdcTokenAbi, signer);
      const PoolContract = new Contract(PoolAddress, PoolContrractAbi, signer);

      const USDTBalance = await USDTContract.balanceOf(address);
      const USDTBalanceInEther = formatUnits(USDTBalance);

      setTookenBalance(USDTBalanceInEther);

      const totalInvestment = await PoolContract.totalStakedAmount();
      const totalInvestmentInEther = formatUnits(totalInvestment);

      setTotalInvestment(totalInvestmentInEther);

      const tusryPoolAmount = await PoolContract.totalStakedAmount();
      const tusryPoolAmountInEther = formatUnits(tusryPoolAmount);

      setTusryPoolAmount(tusryPoolAmountInEther);

      const ownrPoolAmount = await PoolContract.totalStakedAmount();
      const ownrPoolAmountInEther = formatUnits(ownrPoolAmount);

      setOwnrPoolAmount(ownrPoolAmountInEther);

      const totalPoolCap = await PoolContract.totalStakedAmount();
      const totalPoolCapInEther = formatUnits(totalPoolCap);

      setTotalPoolCap(totalPoolCapInEther);

      const tsryPoolPrcntg = await PoolContract.totalStakedAmount();

      setTsryPoolPrcntg(tsryPoolPrcntg);

      const ownrPoolprcntg = await PoolContract.totalStakedAmount();

      setOwnrPoolprcntg(ownrPoolprcntg);
    };

    fetchBalance();
  }, [address]);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Dashboard</h1>
        <ConnectButton />
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
          <div className="price-box">totalInvestment = {totalInvestment}</div>
          <div className="price-box">tusryPoolAmount = {tusryPoolAmount}</div>
          <div className="price-box">ownrPoolAmount = {ownrPoolAmount}</div>
          <div className="price-box">totalPoolCap = {totalPoolCap}</div>
          <div className="price-box">tsryPoolPrcntg = {tsryPoolPrcntg}%</div>
          <div className="price-box">ownrPoolprcntg = {ownrPoolprcntg}%</div>
          <div className="price-box">walletBalance = {balance} ETh</div>
          <div className="price-box">tokenbalance = {tokenbalance} ETh</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

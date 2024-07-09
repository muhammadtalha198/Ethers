import { useWeb3Modal } from "@web3modal/ethers/react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import "./ConnectButton.css";
import {
  projectId,
  mainnet,
  BscMainnet,
  // Bsctestnet,
  Sepolia,
  ethersConfig,
} from "./ConnectWallet";
import { createWeb3Modal } from "@web3modal/ethers/react";

createWeb3Modal({
  ethersConfig,
  chains: [mainnet, BscMainnet, Sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function ConnectButton() {
  // 4. Use modal hook
  const { open } = useWeb3Modal();

  const { address, chainId, isConnected } = useWeb3ModalAccount(); // if need All three

  const handleClick = () => {
    if (!isConnected) {
      // open({ view: "Connect" });
      open({ view: "Networks" });
    } else {
      open({ view: "Account" });
    }
  };

  const displayAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <>
      <button className="wallet-button" onClick={handleClick}>
        {displayAddress}
      </button>
    </>
  );
}
import { useWeb3Modal } from "@web3modal/ethers/react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import "./ConnectButton.css";
import {
  projectId,
  mainnet,
  BscMainnet,
  // Bsctestnet,
  Sepolia,
  ethersConfig,
} from "./ConnectWallet";
import { createWeb3Modal } from "@web3modal/ethers/react";

createWeb3Modal({
  ethersConfig,
  chains: [mainnet, BscMainnet, Sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function ConnectButton() {
  // 4. Use modal hook
  const { open } = useWeb3Modal();

  const { address, chainId, isConnected } = useWeb3ModalAccount(); // if need All three

  const handleClick = () => {
    if (!isConnected) {
      // open({ view: "Connect" });
      open({ view: "Networks" });
    } else {
      open({ view: "Account" });
    }
  };

  const displayAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <>
      <button className="wallet-button" onClick={handleClick}>
        {displayAddress}
      </button>
    </>
  );
}

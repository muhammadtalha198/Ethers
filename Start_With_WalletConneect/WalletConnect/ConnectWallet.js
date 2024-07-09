import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// 1. Get projectId
export const projectId = "39a707fbf63ca756c8ee1880049b6143";

// 2. Set chains
export const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};
export const BscMainnet = {
  chainId: 56,
  name: "BNB Chain",
  currency: "BNB",
  explorerUrl: "https://bscscan.com",
  rpcUrl: "https://bsc-dataseed1.binance.org/",
};

// export const Bsctestnet = {
//   chainId: 97,
//   name: "BNB Chain Testnet",
//   currency: "BNB",
//   explorerUrl: "https://testnet.bscscan.com",
//   rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
// };

export const Sepolia = {
  chainId: 11155111,
  name: "Sepolia Chain Testnet",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://sepolia.infura.io/v3/19d006a71f744023b9382055ab0072df",
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
export const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
  autoConnect: true,
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
});

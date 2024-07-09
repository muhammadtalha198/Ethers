import { BrowserProvider } from "ethers";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";

function OnSignMeessage() {
  const { walletProvider } = useWeb3ModalProvider();

  async function onSignMessage() {
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const signature = await signer?.signMessage("Hello Web3Modal Ethers");
    console.log(signature);
  }

  return <button onClick={() => onSignMessage()}>Sign Message</button>;
}

export default OnSignMeessage;

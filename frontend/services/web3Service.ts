import { ethers } from "ethers";

export const web3Service = {
  async getContract(address: string, abi: any[]) {
    if (typeof window === "undefined" || !window.ethereum) return null;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  },

  async getBalance(address: string) {
    if (typeof window === "undefined" || !window.ethereum) return "0";

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  },

  formatEther(wei: ethers.BigNumber | string) {
    return ethers.utils.formatEther(wei);
  },

  parseEther(ether: string) {
    return ethers.utils.parseEther(ether);
  },
};


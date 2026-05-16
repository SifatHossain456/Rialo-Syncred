import { createConfig, http } from "wagmi";
import { goerli, sepolia, hardhat } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "3b3f52f2a67a3e4e47e0d7f8c1a2b3c4";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet],
    },
    {
      groupName: "More",
      wallets: [walletConnectWallet, trustWallet, rainbowWallet],
    },
  ],
  { appName: "Syncred", projectId }
);

export const config = createConfig({
  chains: [goerli, sepolia],
  connectors,
  transports: {
    [goerli.id]: http(process.env.NEXT_PUBLIC_GOERLI_RPC || "https://rpc.ankr.com/eth_goerli"),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.ankr.com/eth_sepolia"),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = [goerli, sepolia];
export const PRIMARY_CHAIN = goerli;
export const PRIMARY_CHAIN_ID = goerli.id; // 5

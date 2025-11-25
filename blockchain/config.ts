import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

// Define the chains your dApp will support
export const chains = [mainnet, polygon, optimism, arbitrum, base,sepolia];

// Use env var for WalletConnect project id; fall back to placeholder
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Export a wagmi config created by RainbowKit's helper. This is compatible with WagmiConfig.
export const wagmiConfig = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: PROJECT_ID,
  chains:[sepolia],
   transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/OlHr_15i85AUNY6JNMQ2isTduKxgWGFy'),
  },
});

export default wagmiConfig;

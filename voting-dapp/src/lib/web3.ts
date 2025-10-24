import { http } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Configuration de base
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

// Configuration pour Wagmi et RainbowKit v2
const config = getDefaultConfig({
  appName: 'Voting DApp',
  projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  // Configuration requise pour v2+
  ssr: true, // Si vous utilisez SSR
});

export { config };
export const CHAIN = baseSepolia;
export const CHAINS = [baseSepolia];

// Avertissement en développement
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    '⚠️  Avertissement: Utilisation d\'une clé WalletConnect par défaut. ' +
    'Pour le développement local, créez un fichier .env.local avec NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'
  );
}

import { createContext, useContext, useEffect, useState } from 'react';
import { createWalletClient, custom, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

type WalletContextType = {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainId, 16));
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();

    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnect();
    } else {
      setAddress(accounts[0] as `0x${string}`);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    // Reload the page when the chain changes
    window.location.reload();
  };

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or a Web3-compatible browser.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Get the current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Check if we're on the correct network
      const currentChainId = parseInt(chainId, 16);
      setChainId(currentChainId);
      
      if (currentChainId !== baseSepolia.id) {
        try {
          // Try to switch to Base Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if ((switchError as { code: number }).code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${baseSepolia.id.toString(16)}`,
                    chainName: 'Base Sepolia',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.base.org'],
                    blockExplorerUrls: ['https://sepolia.basescan.org/'],
                  },
                ],
              });
            } catch (addError) {
              setError('Failed to add Base Sepolia network to MetaMask');
              console.error('Error adding Base Sepolia network:', addError);
              setIsConnecting(false);
              return;
            }
          } else {
            setError('Failed to switch to Base Sepolia network');
            console.error('Error switching to Base Sepolia:', switchError);
            setIsConnecting(false);
            return;
          }
        }
      }

      setAddress(accounts[0] as `0x${string}`);
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(undefined);
    setIsConnected(false);
    setChainId(undefined);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        chainId,
        connect,
        disconnect,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { CHAIN } from '@/lib/web3';
import Button from '../ui/Button';
import { toast } from 'sonner';

export function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  // Handle hydration
  useEffect(() => setMounted(true), []);
  
  // Handle connection errors
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  // Switch to Base Sepolia if connected to wrong network
  useEffect(() => {
    if (isConnected && chainId !== CHAIN.id) {
      switchChain({ chainId: CHAIN.id });
    }
  }, [isConnected, chainId, switchChain]);

  if (!mounted) {
    return (
      <Button disabled className="bg-gray-500 text-white hover:bg-gray-600">
        Loading...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={!connector.ready}
          >
            {connector.name === 'MetaMask' ? (
              <span className="flex items-center gap-2">
                <img src="/metamask.svg" alt="MetaMask" className="w-5 h-5" />
                Connect with {connector.name}
              </span>
            ) : (
              `Connect with ${connector.name}`
            )}
          </Button>
        ))}
        {status === 'pending' && <div className="text-sm text-gray-500">Awaiting connection...</div>}
      </div>
    );
  }

  // Connected state
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium">
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
      </div>
      <Button
        onClick={() => disconnect()}
        variant="outline"
        className="text-sm text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
      >
        Disconnect
      </Button>
    </div>
  );
}

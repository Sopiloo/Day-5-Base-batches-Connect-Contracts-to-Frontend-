'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { Button } from '@/components/ui/Button';
import { useVoting } from '@/hooks/useVoting';

const features = [
  {
    title: 'Connect Your Wallet',
    description: 'Connect with MetaMask or any Web3 wallet to get started with voting.',
    icon: '🔗',
  },
  {
    title: 'Create Proposals',
    description: 'Submit new proposals for the community to vote on (admin only).',
    icon: '📝',
  },
  {
    title: 'Cast Your Vote',
    description: 'Vote on active proposals and see real-time results.',
    icon: '🗳️',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const { isConnected } = useAccount();
  const { isVotingOpen, isLoading } = useVoting();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Decentralized Voting
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-blue-400 transition-colors">
                  Home
                </Link>
                <Link href="/proposals" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Proposals
                </Link>
                <Link href="/vote" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Vote
                </Link>
                <Link href="/results" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Results
                </Link>
              </div>
              <div className="ml-4">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 pb-16 md:pt-32 md:pb-24"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 mb-6 leading-tight"
          >
            Decentralized Voting on Base
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Create, vote, and manage proposals in a secure and transparent way on the Base blockchain.
            Experience the future of decentralized governance.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {isConnected ? (
              <Link href="/vote" className="block w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  disabled={!isVotingOpen && !isLoading}
                >
                  {isLoading ? 'Loading...' : isVotingOpen ? 'Cast Your Vote' : 'Voting Closed'}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="primary" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                disabled={true}
              >
                Connect Wallet to Vote
              </Button>
            )}
            <Link href="/proposals" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-lg border-2 hover:bg-gray-800/50 transition-all duration-300"
              >
                View Proposals
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Decentralized Voting
              </h2>
              <p className="text-gray-400 text-sm mt-1">Built on Base Network</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Decentralized Voting. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

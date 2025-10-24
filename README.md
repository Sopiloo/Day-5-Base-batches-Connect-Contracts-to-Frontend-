# Base Bootcamp - Day 5: Connect Smart Contracts to Frontend

## 📌 Project Overview
This project demonstrates how to connect Solidity smart contracts to a Next.js frontend, creating a full-stack decentralized application (dApp) on the Base Sepolia testnet. The application includes features like contract interaction, event listening, and transaction management.

## 🎯 Learning Objectives
- Work with ABIs to interact with smart contracts
- Read and write data to smart contracts from a frontend
- Listen to and handle blockchain events in real-time
- Build a complete voting dApp with admin and user interfaces
- Implement wallet connection and transaction signing

## 🏗️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Smart Contracts**: Solidity, Foundry
- **Blockchain**: Base Sepolia Testnet
- **Web3 Libraries**: Wagmi, viem
- **Wallet Integration**: MetaMask, WalletConnect

## 📂 Project Structure
```
.
├── VotingContract/          # Solidity smart contracts
│   ├── src/                
│   ├── test/               
│   └── script/             # Deployment scripts
└── voting-dapp/            # Next.js frontend
    ├── src/
    │   ├── app/           # Next.js app router
    │   ├── components/    # Reusable UI components
    │   ├── contracts/     # ABIs and contract interactions
    │   └── hooks/         # Custom React hooks
    └── public/            # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Foundry (for smart contract development)
- MetaMask (browser extension)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sopiloo/Day-5-Base-batches-Connect-Contracts-to-Frontend-.git
   cd Day-5-Base-batches-Connect-Contracts-to-Frontend-
   ```

2. **Set up the frontend**
   ```bash
   cd voting-dapp
   npm install
   cp .env.example .env.local
   # Update environment variables in .env.local
   ```

3. **Configure environment variables**
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xbDa441A907D5549Ac9A5f8e04e66328836BE4F71
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Features

### Smart Contract
- Create and manage proposals
- Secure voting mechanism
- Admin controls for contract management
- Event emissions for all state changes

### Frontend
- Wallet connection with MetaMask
- View and create proposals
- Cast votes on active proposals
- Real-time updates using contract events
- Admin dashboard for contract management

## 📚 Key Concepts

### Contract Interaction
- Reading data using `useContractRead`
- Writing data with `useContractWrite`
- Listening to events with `useContractEvent`
- Managing transaction states and confirmations


## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.




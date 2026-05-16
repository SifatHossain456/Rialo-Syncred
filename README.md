# Syncred — Async Credit & Payment Verification Protocol

> **"Most blockchains process transactions instantly. We process workflows."**

Built on Rialo Testnet (Goerli/Sepolia). Demonstrates native async execution for real-world financial workflows.

---

## Features

- **Wallet Connect** — MetaMask, Rabby, Coinbase, WalletConnect supported via RainbowKit
- **Goerli Testnet** — Auto network detection + one-click switch
- **Async Loan Workflows** — PENDING → VERIFYING → COMPLETED lifecycle onchain
- **Real Contract Calls** — requestLoan, approveWorkflow, cancelWorkflow, depositFunds
- **Credit Profile** — Onchain credit score derived from wallet history
- **Admin Panel** — Owner-gated approve/reject with real Solidity calls
- **Live Analytics** — Real data from smart contract state
- **Toast Notifications** — Transaction status, confirmations, errors
- **Wrong Network Guard** — Banner + auto-switch to Goerli

---

## Quick Start

### 1. Deploy Contract (Goerli)

```bash
cd contracts
npm install
cp .env.example .env
# Fill: GOERLI_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
npm run deploy:goerli
```

Copy the deployed contract address.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set:
# NEXT_PUBLIC_WC_PROJECT_ID=... (from cloud.walletconnect.com)
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (from step 1)
npm run dev
```

### 3. Backend (Mock Verification APIs)

```bash
cd backend
npm install
npm run dev  # runs on localhost:4000
```

---

## Architecture

```
User connects MetaMask (Goerli)
        ↓
requestLoan() → Contract state: PENDING
        ↓
Backend /api/workflow/verify
  → KYC check (mock)
  → Credit score check
  → Wallet analysis
        ↓
approveWorkflow() or rejectWorkflow()
        ↓
State: COMPLETED — ETH auto-disbursed to user
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect project ID from cloud.walletconnect.com |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed AsyncLending contract address |
| `NEXT_PUBLIC_GOERLI_RPC` | Custom Goerli RPC (optional, default: Ankr) |
| `NEXT_PUBLIC_SEPOLIA_RPC` | Custom Sepolia RPC (optional) |

### Contracts (`contracts/.env`)

| Variable | Description |
|---|---|
| `GOERLI_RPC_URL` | Goerli RPC endpoint (Infura/Alchemy/Ankr) |
| `PRIVATE_KEY` | Deployer wallet private key |
| `ETHERSCAN_API_KEY` | For contract verification |

---

## Smart Contract

**AsyncLending.sol** — Goerli deployed

| Function | Who | Description |
|---|---|---|
| `requestLoan(amount)` | User | Create loan request |
| `requestPaymentVerification(amount)` | User | Create payment verification |
| `cancelWorkflow(id)` | User (owner) | Cancel PENDING request |
| `startVerification(id)` | Verifier | Move to VERIFYING |
| `approveWorkflow(id)` | Verifier | Approve + auto-disburse funds |
| `rejectWorkflow(id, reason)` | Verifier | Reject with reason |
| `depositFunds()` | Owner | Fund the loan pool |
| `getAllWorkflows()` | Anyone | Read all workflows |

---

## Pages

| Page | Description |
|---|---|
| `/` | Landing — connect CTA, async flow explanation |
| `/dashboard` | Request loans, track workflows, cancel pending |
| `/profile` | Credit score, wallet stats, loan history |
| `/admin` | Owner-only: approve/reject, fund pool |
| `/analytics` | Live charts from contract state |

---

## Deployment (Vercel)

Vercel auto-detects multi-service via `vercel.json`. After deploy:
1. Add environment variables in Vercel dashboard
2. Frontend live at `/`
3. Backend API at `/_/backend/api/...`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Smart Contracts | Solidity 0.8.20 + Hardhat |
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Wallet | wagmi v2 + viem + RainbowKit |
| Animations | Framer Motion |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Backend | Node.js + Express |

---

*Built for Rialo Testnet — demonstrating async execution for real-world financial workflows.*

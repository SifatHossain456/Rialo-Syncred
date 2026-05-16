# Syncred — Async Credit & Payment Verification Protocol

> **"Most blockchains process transactions instantly. We process workflows."**

Built on Rialo Testnet. Demonstrates native async execution for real-world financial workflows.

---

## What Is Syncred?

Syncred is a decentralized lending + payment workflow system where transactions can:

1. **Start** onchain
2. **Pause** while waiting for external verification
3. **Resume** automatically after verification passes
4. **Complete** settlement without any manual admin interaction

This demonstrates how Rialo-style async execution enables real-world finance on blockchain.

---

## Architecture

```
User → requestLoan() → Contract (PENDING)
         ↓
    Backend detects event
         ↓
    KYC + Credit + Wallet Analysis
         ↓
    approveWorkflow() / rejectWorkflow()
         ↓
    Contract auto-releases funds (COMPLETED)
```

---

## Project Structure

```
Rialo-Syncred/
├── contracts/     # Solidity smart contracts (Hardhat)
├── frontend/      # Next.js + Tailwind + Framer Motion
├── backend/       # Node.js mock verification service
└── docs/          # Documentation
```

---

## Quick Start

### Smart Contracts

```bash
cd contracts
npm install
npm run compile
npm run test
npm run deploy:local    # local Hardhat network
npm run deploy:goerli   # Goerli testnet
```

Copy `.env.example` → `.env` and fill in your keys.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000`

---

## Smart Contract

**AsyncLending.sol** — Core workflow contract

| Function | Description |
|---|---|
| `requestLoan(amount)` | Create loan request (PENDING) |
| `requestPaymentVerification(amount)` | Create payment verification |
| `startVerification(id)` | Move to VERIFYING state |
| `approveWorkflow(id)` | Approve + auto-disburse |
| `rejectWorkflow(id, reason)` | Reject with reason |
| `cancelWorkflow(id)` | User cancels PENDING request |
| `getAllWorkflows()` | Fetch all workflow data |

**Workflow States:**
```
PENDING → VERIFYING → APPROVED → COMPLETED
                   ↘ REJECTED
```

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Protocol overview + async flow explanation |
| Dashboard | `/dashboard` | Live workflow tracking + loan requests |
| Admin | `/admin` | Simulate verification events |
| Analytics | `/analytics` | Charts: volume, approval rate, settlement time |

---

## Backend API

| Endpoint | Method | Description |
|---|---|---|
| `/api/kyc/verify` | POST | Mock KYC verification |
| `/api/kyc/status/:address` | GET | KYC status lookup |
| `/api/credit/score/:address` | GET | Credit score (300-1000) |
| `/api/workflow/verify` | POST | Full async verification pipeline |
| `/api/workflow/logs` | GET | Recent verification logs |
| `/api/health` | GET | Service health check |

---

## Demo Flow

1. Open Dashboard → enter loan amount → click **Request Loan**
2. Watch workflow appear as **PENDING**
3. Status auto-transitions to **VERIFYING**
4. Backend runs KYC + credit check + wallet analysis
5. Workflow resolves to **COMPLETED** (funds released) or **REJECTED**
6. Check Analytics for performance metrics

---

## Tech Stack

- **Smart Contracts:** Solidity 0.8.20 + Hardhat
- **Frontend:** Next.js 14 + TypeScript + TailwindCSS + Framer Motion + Recharts
- **Backend:** Node.js + Express
- **Network:** Goerli / Sepolia Testnet

---

## License

MIT

---

*Built for Rialo Testnet — demonstrating async execution for real-world financial workflows.*

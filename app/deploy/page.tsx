"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Terminal, Code2, CheckCircle, Copy, Check,
  ArrowRight, ExternalLink, Zap, BookOpen, AlertTriangle
} from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative bg-dark-900 border border-slate-700/50 rounded-xl overflow-hidden my-3 group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60">
        <span className="text-slate-500 text-xs font-mono">{lang}</span>
        <button onClick={copyCode}
          className="flex items-center gap-1.5 text-slate-500 hover:text-neon-cyan text-xs transition-all">
          {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Step({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/25 flex items-center justify-center font-mono text-neon-cyan text-sm font-bold">
          {num}
        </div>
        <div className="flex-1 w-px bg-slate-800/60 mt-2 mb-2" />
      </div>
      <div className="pb-8 flex-1">
        <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
        <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
      </div>
    </motion.div>
  );
}

export default function DeployPage() {
  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-dark-800 border border-neon-cyan/20 rounded-full px-4 py-1.5 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-neon-cyan text-xs font-mono uppercase tracking-widest">Deploy Guide</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Deploy Syncred Contracts</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Follow these steps to deploy the AsyncLending contract to Goerli Testnet and connect it to the frontend.
            </p>
          </motion.div>
        </div>

        {/* Warning */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-400/8 border border-amber-400/20 rounded-2xl p-5 mb-10 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">Testnet only.</span> This guide deploys to Goerli or Sepolia — never mainnet. You need testnet ETH to pay gas. Get some from the{" "}
            <Link href="/faucet" className="text-neon-cyan hover:underline">Faucet page</Link>.
          </div>
        </motion.div>

        {/* Prerequisites */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="bg-dark-800 border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Prerequisites
          </h2>
          <div className="space-y-2">
            {[
              "Node.js 18+ installed",
              "Git installed",
              "MetaMask wallet with Goerli ETH",
              "Alchemy or Infura account (for RPC URL)",
              "Etherscan API key (optional, for verification)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <div>
          <Step num="01" title="Clone the repository">
            <p>Clone the Syncred repo and navigate to the contracts directory:</p>
            <CodeBlock code={`git clone https://github.com/SifatHossain456/Rialo-Syncred.git
cd Rialo-Syncred/contracts`} />
          </Step>

          <Step num="02" title="Install dependencies">
            <p>Install the Hardhat toolchain and dependencies:</p>
            <CodeBlock code="npm install" />
          </Step>

          <Step num="03" title="Configure environment variables">
            <p>Copy the example env file and fill in your values:</p>
            <CodeBlock code="cp .env.example .env" />
            <p className="mt-2">Edit <code className="text-neon-cyan font-mono text-xs bg-dark-900 px-1.5 py-0.5 rounded">.env</code> with your values:</p>
            <CodeBlock lang=".env" code={`GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_key_optional`} />
            <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-3 mt-2 text-xs text-rose-300">
              Never commit your private key. The .env file is in .gitignore.
            </div>
          </Step>

          <Step num="04" title="Compile the contract">
            <p>Compile AsyncLending.sol with Hardhat:</p>
            <CodeBlock code="npx hardhat compile" />
            <p>You should see: <code className="text-emerald-400 font-mono text-xs">Compiled 1 Solidity file successfully</code></p>
          </Step>

          <Step num="05" title="Run tests (optional but recommended)">
            <p>Verify the contract behaves correctly before deploying:</p>
            <CodeBlock code="npx hardhat test" />
            <p>All tests should pass. The test file covers loan requests, state transitions, approvals, rejections, and cancellations.</p>
          </Step>

          <Step num="06" title="Deploy to Goerli">
            <p>Deploy the contract. The script also funds the pool with 0.1 ETH:</p>
            <CodeBlock code="npx hardhat run scripts/deploy.js --network goerli" />
            <p>You'll see output like:</p>
            <CodeBlock lang="output" code={`AsyncLending deployed to: 0xYourContractAddress
Funding contract with 0.1 ETH...
Contract funded. Balance: 0.1 ETH`} />
            <p className="mt-1">Save the contract address — you'll need it next.</p>
          </Step>

          <Step num="07" title="Verify on Etherscan (optional)">
            <p>If you have an Etherscan API key, verify the source code:</p>
            <CodeBlock code="npx hardhat verify --network goerli 0xYourContractAddress" />
            <p>This makes the ABI and source code publicly visible on Etherscan.</p>
          </Step>

          <Step num="08" title="Connect frontend to deployed contract">
            <p>Navigate to the frontend directory:</p>
            <CodeBlock code="cd ../frontend" />
            <p>Copy the env example and set your values:</p>
            <CodeBlock code="cp .env.example .env.local" />
            <CodeBlock lang=".env.local" code={`NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_KEY`} />
            <p>Install and start the frontend:</p>
            <CodeBlock code={`npm install
npm run dev`} />
            <p>Open <span className="text-neon-cyan font-mono text-xs">http://localhost:3000</span> — the demo mode banner will be gone and your real contract will be live!</p>
          </Step>

          <Step num="09" title="Fund the loan pool (as admin)">
            <p>After deploying, deposit ETH into the loan pool via the Admin panel:</p>
            <div className="bg-dark-900/60 border border-slate-700/50 rounded-xl p-4 my-2">
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium mb-1">Admin Panel → Deposit to Pool</div>
                  <div className="text-slate-400 text-xs">Connect with the deployer wallet, go to Admin page, and deposit ETH to the pool. Only the contract owner can approve/reject workflows.</div>
                </div>
              </div>
            </div>
          </Step>
        </div>

        {/* Quick reference */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-dark-800 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neon-cyan" /> Quick Reference
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Compile", cmd: "npx hardhat compile" },
              { label: "Test",    cmd: "npx hardhat test" },
              { label: "Deploy Goerli",  cmd: "npx hardhat run scripts/deploy.js --network goerli" },
              { label: "Deploy Sepolia", cmd: "npx hardhat run scripts/deploy.js --network sepolia" },
              { label: "Verify", cmd: "npx hardhat verify --network goerli <address>" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-28 flex-shrink-0">{r.label}</span>
                <code className="text-neon-cyan text-xs font-mono bg-dark-900 border border-slate-700/50 px-3 py-1.5 rounded-lg flex-1">{r.cmd}</code>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "GitHub Repo", href: "https://github.com/SifatHossain456/Rialo-Syncred", icon: <Code2 className="w-4 h-4" />, ext: true },
            { label: "Faucet Guide", href: "/faucet", icon: <Zap className="w-4 h-4" />, ext: false },
            { label: "Dashboard", href: "/dashboard", icon: <ArrowRight className="w-4 h-4" />, ext: false },
          ].map((l, i) => (
            l.ext ? (
              <a key={i} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-dark-800 border border-slate-700/50 hover:border-neon-cyan/30 text-slate-400 hover:text-neon-cyan px-5 py-3 rounded-xl text-sm font-medium transition-all">
                {l.icon} {l.label} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </a>
            ) : (
              <Link key={i} href={l.href}
                className="flex items-center justify-center gap-2 bg-dark-800 border border-slate-700/50 hover:border-neon-cyan/30 text-slate-400 hover:text-neon-cyan px-5 py-3 rounded-xl text-sm font-medium transition-all">
                {l.icon} {l.label}
              </Link>
            )
          ))}
        </motion.div>
      </div>
    </div>
  );
}

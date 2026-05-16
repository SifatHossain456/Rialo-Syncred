const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");

const workflowLogs = [];

// POST /api/workflow/verify — simulate full async verification pipeline
router.post("/verify", async (req, res) => {
  const { workflowId, address, amount } = req.body;
  if (!workflowId || !address) {
    return res.status(400).json({ error: "workflowId and address required" });
  }

  const log = {
    workflowId,
    address,
    amount,
    startedAt: new Date().toISOString(),
    steps: [],
  };

  // Step 1: KYC check
  await new Promise((r) => setTimeout(r, 800));
  const kycPassed = Math.random() > 0.15;
  log.steps.push({ step: "KYC", passed: kycPassed, timestamp: new Date().toISOString() });

  if (!kycPassed) {
    log.finalDecision = "REJECTED";
    log.reason = "KYC verification failed";
    log.completedAt = new Date().toISOString();
    workflowLogs.push(log);
    return res.json({ approved: false, reason: "KYC verification failed", log });
  }

  // Step 2: Credit check
  await new Promise((r) => setTimeout(r, 600));
  const creditScore = 300 + Math.floor(Math.random() * 700);
  const creditPassed = creditScore >= 450;
  log.steps.push({ step: "CREDIT", score: creditScore, passed: creditPassed, timestamp: new Date().toISOString() });

  if (!creditPassed) {
    log.finalDecision = "REJECTED";
    log.reason = `Credit score too low: ${creditScore}`;
    log.completedAt = new Date().toISOString();
    workflowLogs.push(log);
    return res.json({ approved: false, reason: `Credit score too low: ${creditScore}`, log });
  }

  // Step 3: Wallet analysis
  await new Promise((r) => setTimeout(r, 400));
  const walletOk = Math.random() > 0.1;
  log.steps.push({ step: "WALLET_ANALYSIS", passed: walletOk, timestamp: new Date().toISOString() });

  if (!walletOk) {
    log.finalDecision = "REJECTED";
    log.reason = "Suspicious wallet activity detected";
    log.completedAt = new Date().toISOString();
    workflowLogs.push(log);
    return res.json({ approved: false, reason: "Suspicious wallet activity detected", log });
  }

  log.finalDecision = "APPROVED";
  log.creditScore = creditScore;
  log.completedAt = new Date().toISOString();
  workflowLogs.push(log);
  res.json({ approved: true, creditScore, log });
});

router.get("/logs", (req, res) => {
  res.json({ logs: workflowLogs.slice(-50).reverse(), total: workflowLogs.length });
});

module.exports = router;

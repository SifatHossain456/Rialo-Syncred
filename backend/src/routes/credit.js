const express = require("express");
const router = express.Router();

const creditDatabase = new Map();

function generateCreditScore(address) {
  // Deterministic mock score based on address
  const hash = address.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 300 + (hash % 700); // Score between 300-1000
}

function getRiskLevel(score) {
  if (score >= 750) return "LOW";
  if (score >= 600) return "MEDIUM";
  if (score >= 450) return "HIGH";
  return "VERY_HIGH";
}

router.get("/score/:address", async (req, res) => {
  const { address } = req.params;

  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

  if (creditDatabase.has(address.toLowerCase())) {
    return res.json(creditDatabase.get(address.toLowerCase()));
  }

  const score = generateCreditScore(address);
  const result = {
    address,
    score,
    riskLevel: getRiskLevel(score),
    maxLoanAmount: score >= 600 ? "5.0" : score >= 450 ? "1.0" : "0.1",
    approved: score >= 450,
    timestamp: new Date().toISOString(),
    factors: {
      paymentHistory: Math.floor(Math.random() * 40) + 60,
      walletAge: Math.floor(Math.random() * 30) + 70,
      transactionVolume: Math.floor(Math.random() * 35) + 65,
      defiActivity: Math.floor(Math.random() * 25) + 75,
    },
  };

  creditDatabase.set(address.toLowerCase(), result);
  res.json(result);
});

module.exports = router;

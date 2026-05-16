const express = require("express");
const router = express.Router();

// Mock KYC verification service
// In production, this would call a real KYC provider (Jumio, Onfido, etc.)
const kycDatabase = new Map();

router.post("/verify", async (req, res) => {
  const { address, name, nationalId } = req.body;
  if (!address) return res.status(400).json({ error: "Address required" });

  // Simulate async KYC check (1-2 seconds)
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

  // Mock logic: addresses ending in even hex digit pass KYC
  const lastChar = address.slice(-1).toLowerCase();
  const evenHex = ["0", "2", "4", "6", "8", "a", "c", "e"];
  const approved = evenHex.includes(lastChar) || Math.random() > 0.2;

  const result = {
    address,
    approved,
    timestamp: new Date().toISOString(),
    verificationId: `KYC-${Date.now()}`,
    reason: approved ? "Identity verified successfully" : "Could not verify identity documents",
  };

  kycDatabase.set(address.toLowerCase(), result);
  res.json(result);
});

router.get("/status/:address", (req, res) => {
  const { address } = req.params;
  const record = kycDatabase.get(address.toLowerCase());
  if (!record) return res.json({ address, approved: false, verified: false });
  res.json({ ...record, verified: true });
});

module.exports = router;

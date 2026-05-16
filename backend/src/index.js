require("dotenv").config();
const express = require("express");
const cors = require("cors");
const kycRoutes = require("./routes/kyc");
const creditRoutes = require("./routes/credit");
const workflowRoutes = require("./routes/workflow");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/kyc", kycRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/workflow", workflowRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Rialo Syncred Backend", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Rialo Syncred backend running on port ${PORT}`);
});

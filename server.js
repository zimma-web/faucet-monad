require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: { message: "Too many requests. Please try again later." },
});
app.use("/claim", limiter);

app.post("/claim", async (req, res) => {
  const { wallet, token } = req.body;

  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({ message: "Invalid wallet address." });
  }

  // Verify hCaptcha
  const verify = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
  });

  const captchaResult = await verify.json();
  if (!captchaResult.success) {
    return res.status(400).json({ message: "hCaptcha verification failed." });
  }

  // Simulate token sending (replace with real on-chain transfer here)
  console.log(`Sending token to ${wallet}`);
  return res.json({ message: `✅ Token sent to ${wallet}!` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

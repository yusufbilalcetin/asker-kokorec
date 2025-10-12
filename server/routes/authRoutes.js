import express from "express";
const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: process.env.ADMIN_TOKEN });
  }
  return res.status(401).json({ message: "Unauthorized" });
});

export default router;

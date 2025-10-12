import express from "express";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// List grouped by category
router.get("/", async (_req, res) => {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json(items);
});

// Update price (protected by simple token header)
router.put("/:id", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { price } = req.body;
  const parsed = (price === "" || price === null) ? null : Number(price);
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { price: isNaN(parsed) ? null : parsed },
    { new: true }
  );
  res.json(item);
});

export default router;

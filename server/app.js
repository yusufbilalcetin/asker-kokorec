import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import menuRoutes from "./routes/menuRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import MenuItem from "./models/MenuItem.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ✅ public klasörünü düzgün bağla
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/askerkokorec";
await mongoose.connect(MONGO_URI);

// --- Menü verilerini ilk seferde ekle ---
const defaultItems = [
  ["Ekmek Araları", "Bütün Kokoreç"],
  ["Ekmek Araları", "Üç Çeyrek Kokoreç"],
  ["Ekmek Araları", "Yarım Kokoreç"],
  ["Tatlılar", "Halka Tatlısı"],
  ["İçecekler", "Ayran"],
  ["Çiğ Köfte", "Çiğ Köfte Dürüm"]
];
const count = await MenuItem.countDocuments();
if (count === 0) {
  await MenuItem.insertMany(defaultItems.map(([c, n]) => ({ category: c, name: n, price: null })));
  console.log("Seeded default menu items.");
}

// --- API rotaları ---
app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);

// ✅ Müşteri ve admin için HTML yönlendirmesi
app.get(["/", "/admin"], (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// --- Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server çalışıyor: http://localhost:${PORT}`));

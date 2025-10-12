import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.model("MenuItem", menuItemSchema);

import mongoose from "mongoose";

const pumpSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true, required: true, trim: true },
    label: { type: String, trim: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Pump", pumpSchema);


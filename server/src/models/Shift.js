import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["Morning Shift", "Night Shift"], required: true, unique: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Shift", shiftSchema);


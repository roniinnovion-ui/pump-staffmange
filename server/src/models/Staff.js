import mongoose from "mongoose";

const shiftHistorySchema = new mongoose.Schema(
  {
    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    pump: { type: mongoose.Schema.Types.ObjectId, ref: "Pump", required: true },
    changedAt: { type: Date, default: Date.now },
    note: String
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    staffId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    designation: { type: String, required: true, trim: true },
    fingerprintId: { type: String, required: true, unique: true, trim: true },
    assignedShift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    assignedPump: { type: mongoose.Schema.Types.ObjectId, ref: "Pump", required: true },
    joiningDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    shiftHistory: [shiftHistorySchema]
  },
  { timestamps: true }
);

staffSchema.pre("save", async function makeStaffId(next) {
  if (this.staffId) return next();
  const count = await mongoose.model("Staff").countDocuments();
  this.staffId = `STF${String(count + 1).padStart(4, "0")}`;
  next();
});

export default mongoose.model("Staff", staffSchema);


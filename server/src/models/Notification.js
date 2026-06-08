import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Late Entry", "Early Exit", "Staff Absent", "Missed Fingerprint", "Overtime"],
      required: true
    },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);

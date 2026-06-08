import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    staffId: String,
    staffName: String,
    date: { type: String, required: true, index: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    shiftName: String,
    pump: { type: mongoose.Schema.Types.ObjectId, ref: "Pump", required: true },
    pumpNumber: String,
    joinDuty: Date,
    lunchOut: Date,
    lunchIn: Date,
    exitDuty: Date,
    events: [
      {
        type: {
          type: String,
          enum: ["Join Duty", "Lunch Out", "Lunch In", "Exit Duty", "Manual Correction"],
          required: true
        },
        time: { type: Date, required: true },
        source: { type: String, enum: ["biometric", "manual"], default: "biometric" },
        note: String
      }
    ],
    lateMinutes: { type: Number, default: 0 },
    earlyExitMinutes: { type: Number, default: 0 },
    lunchMinutes: { type: Number, default: 0 },
    totalDutyMinutes: { type: Number, default: 0 },
    netWorkingMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ["On Duty", "On Lunch Break", "Off Duty"], default: "Off Duty" }
  },
  { timestamps: true }
);

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);


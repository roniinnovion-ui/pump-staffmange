import { Router } from "express";
import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import Pump from "../models/Pump.js";
import Shift from "../models/Shift.js";
import { requireAuth } from "../middleware/auth.js";
import { dateKey } from "../utils/time.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (_req, res) => {
  const today = dateKey();
  const [totalStaff, presentToday, shifts, pumps, attendanceToday] = await Promise.all([
    Staff.countDocuments({ active: true }),
    Attendance.countDocuments({ date: today, joinDuty: { $ne: null } }),
    Shift.find(),
    Pump.find({ active: true }),
    Attendance.find({ date: today })
  ]);
  const staffByShift = await Staff.aggregate([{ $match: { active: true } }, { $group: { _id: "$assignedShift", count: { $sum: 1 } } }]);
  const shiftCounts = Object.fromEntries(staffByShift.map((item) => [String(item._id), item.count]));
  const pumpCounts = await Staff.aggregate([{ $match: { active: true } }, { $group: { _id: "$assignedPump", count: { $sum: 1 } } }]);
  const pumpMap = Object.fromEntries(pumps.map((pump) => [String(pump._id), pump.number]));

  res.json({
    cards: {
      totalStaff,
      presentToday,
      absentToday: Math.max(0, totalStaff - presentToday),
      morningShiftStaff: shifts.find((s) => s.name === "Morning Shift") ? shiftCounts[String(shifts.find((s) => s.name === "Morning Shift")._id)] || 0 : 0,
      nightShiftStaff: shifts.find((s) => s.name === "Night Shift") ? shiftCounts[String(shifts.find((s) => s.name === "Night Shift")._id)] || 0 : 0,
      staffOnDuty: attendanceToday.filter((a) => a.status === "On Duty").length,
      staffOnLunch: attendanceToday.filter((a) => a.status === "On Lunch Break").length,
      lateEntriesToday: attendanceToday.filter((a) => a.lateMinutes > 0).length,
      earlyExitsToday: attendanceToday.filter((a) => a.earlyExitMinutes > 0).length
    },
    charts: {
      dailyAttendance: [{ name: "Present", value: presentToday }, { name: "Absent", value: Math.max(0, totalStaff - presentToday) }],
      shiftWise: shifts.map((shift) => ({ name: shift.name, value: shiftCounts[String(shift._id)] || 0 })),
      pumpWise: pumpCounts.map((item) => ({ name: `Pump ${pumpMap[String(item._id)] || "N/A"}`, value: item.count }))
    }
  });
});

export default router;


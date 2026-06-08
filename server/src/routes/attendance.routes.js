import { Router } from "express";
import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import { requireAuth } from "../middleware/auth.js";
import { manualCorrection } from "../services/attendance.service.js";
import { dateKey } from "../utils/time.js";

const router = Router();
router.use(requireAuth);

function buildFilter(query) {
  const filter = {};
  if (query.date) filter.date = query.date;
  if (query.staff) filter.staff = query.staff;
  if (query.shift) filter.shift = query.shift;
  if (query.pump) filter.pump = query.pump;
  return filter;
}

router.get("/", async (req, res) => {
  const items = await Attendance.find(buildFilter(req.query)).populate("staff shift pump").sort({ date: -1, createdAt: -1 });
  res.json(items);
});

router.get("/live-status", async (_req, res) => {
  const today = dateKey();
  const activeStaff = await Staff.find({ active: true }).populate("assignedShift").populate("assignedPump");
  const todayRows = await Attendance.find({ date: today });
  const byStaff = new Map(todayRows.map((row) => [String(row.staff), row]));
  res.json(
    activeStaff.map((staff) => {
      const row = byStaff.get(String(staff._id));
      return {
        staff: staff._id,
        name: staff.name,
        shift: staff.assignedShift?.name,
        pumpNumber: staff.assignedPump?.number,
        status: row?.status || "Off Duty",
        joinDuty: row?.joinDuty,
        lunchOut: row?.lunchOut,
        lunchIn: row?.lunchIn,
        exitDuty: row?.exitDuty
      };
    })
  );
});

router.put("/:id/correct", async (req, res, next) => {
  try {
    res.json(await manualCorrection(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.json({ message: "Attendance deleted" });
});

export default router;

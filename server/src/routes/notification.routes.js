import { Router } from "express";
import Notification from "../models/Notification.js";
import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import { requireAuth } from "../middleware/auth.js";
import { dateKey, shiftBounds } from "../utils/time.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => res.json(await Notification.find().populate("staff").sort({ createdAt: -1 }).limit(100)));
router.get("/pending-attendance", async (_req, res) => {
  const today = dateKey();
  const [staff, attendance] = await Promise.all([
    Staff.find({ active: true }).populate("assignedShift").populate("assignedPump"),
    Attendance.find({ date: today, joinDuty: { $ne: null } }).select("staff")
  ]);
  const joinedIds = new Set(attendance.map((row) => String(row.staff)));
  const now = new Date();
  const pending = staff
    .map((person) => {
      const { start } = shiftBounds(today, person.assignedShift);
      const lateByMinutes = Math.floor((now - start.toDate()) / 60000);
      return {
        staff: person._id,
        name: person.name,
        shift: person.assignedShift?.name,
        pumpNumber: person.assignedPump?.number,
        shiftStart: start.toDate(),
        lateByMinutes
      };
    })
    .filter((person) => !joinedIds.has(String(person.staff)) && person.lateByMinutes >= 60);
  res.json(pending);
});
router.put("/:id/read", async (req, res) => res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })));

export default router;

import { Router } from "express";
import Staff from "../models/Staff.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const q = req.query.q || "";
  const filter = q
    ? { $or: [{ name: new RegExp(q, "i") }, { staffId: new RegExp(q, "i") }, { mobile: new RegExp(q, "i") }] }
    : {};
  const staff = await Staff.find(filter).populate("assignedShift").populate("assignedPump").sort({ createdAt: -1 });
  res.json(staff);
});

router.post("/", requireRole("Super Admin"), async (req, res) => {
  const staff = await Staff.create({ ...req.body, shiftHistory: [{ shift: req.body.assignedShift, pump: req.body.assignedPump, note: "Initial assignment" }] });
  res.status(201).json(await staff.populate(["assignedShift", "assignedPump"]));
});

router.get("/:id", async (req, res) => {
  const staff = await Staff.findById(req.params.id).populate("assignedShift").populate("assignedPump").populate("shiftHistory.shift").populate("shiftHistory.pump");
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
});

router.put("/:id", requireRole("Super Admin"), async (req, res) => {
  const current = await Staff.findById(req.params.id);
  if (!current) return res.status(404).json({ message: "Staff not found" });
  if (String(current.assignedShift) !== String(req.body.assignedShift) || String(current.assignedPump) !== String(req.body.assignedPump)) {
    current.shiftHistory.push({ shift: req.body.assignedShift, pump: req.body.assignedPump, note: req.body.note || "Assignment changed" });
  }
  Object.assign(current, req.body);
  await current.save();
  res.json(await current.populate(["assignedShift", "assignedPump"]));
});

router.delete("/:id", requireRole("Super Admin"), async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.json({ message: "Staff deleted" });
});

export default router;


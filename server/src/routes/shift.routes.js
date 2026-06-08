import { Router } from "express";
import Shift from "../models/Shift.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => res.json(await Shift.find().sort({ name: 1 })));
router.post("/", requireRole("Super Admin"), async (req, res) => res.status(201).json(await Shift.create(req.body)));
router.put("/:id", requireRole("Super Admin"), async (req, res) => res.json(await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", requireRole("Super Admin"), async (req, res) => res.json(await Shift.findByIdAndUpdate(req.params.id, { active: false }, { new: true })));

export default router;


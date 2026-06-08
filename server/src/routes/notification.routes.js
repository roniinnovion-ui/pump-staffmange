import { Router } from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => res.json(await Notification.find().populate("staff").sort({ createdAt: -1 }).limit(100)));
router.put("/:id/read", async (req, res) => res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })));

export default router;


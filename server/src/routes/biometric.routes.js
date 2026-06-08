import { Router } from "express";
import { handleZktecoPayload } from "../services/zkteco.service.js";

const router = Router();

router.post("/fingerprint", async (req, res, next) => {
  try {
    const attendance = await handleZktecoPayload(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
});

export default router;

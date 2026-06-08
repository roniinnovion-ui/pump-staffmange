import { recordFingerprint } from "./attendance.service.js";

export async function handleZktecoPayload(payload) {
  const fingerprintId = payload.fingerprintId || payload.pin || payload.userId;
  const scannedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();
  return recordFingerprint(String(fingerprintId), scannedAt);
}

export async function startDeviceListener() {
  console.log("ZKTeco listener placeholder ready. Connect vendor SDK here.");
}


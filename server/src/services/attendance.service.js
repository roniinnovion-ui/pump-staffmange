import dayjs from "dayjs";
import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import { createNotification } from "./notification.service.js";
import { dateKey, minutesBetween, shiftBounds } from "../utils/time.js";

const flow = [
  ["joinDuty", "Join Duty", "On Duty"],
  ["lunchOut", "Lunch Out", "On Lunch Break"],
  ["lunchIn", "Lunch In", "On Duty"],
  ["exitDuty", "Exit Duty", "Off Duty"]
];

function nextEventType(attendance) {
  return flow.find(([field]) => !attendance[field]) || null;
}

function recalculate(attendance, shift, eventDate) {
  const { start, end } = shiftBounds(eventDate, shift);
  attendance.lateMinutes = attendance.joinDuty
    ? Math.max(0, dayjs(attendance.joinDuty).diff(start, "minute"))
    : 0;
  attendance.earlyExitMinutes = attendance.exitDuty
    ? Math.max(0, end.diff(dayjs(attendance.exitDuty), "minute"))
    : 0;
  attendance.lunchMinutes = minutesBetween(attendance.lunchOut, attendance.lunchIn);
  attendance.totalDutyMinutes = minutesBetween(attendance.joinDuty, attendance.exitDuty);
  attendance.netWorkingMinutes = Math.max(0, attendance.totalDutyMinutes - attendance.lunchMinutes);
}

export async function recordFingerprint(fingerprintId, scannedAt = new Date()) {
  const staff = await Staff.findOne({ fingerprintId, active: true })
    .populate("assignedShift")
    .populate("assignedPump");
  if (!staff) {
    const error = new Error("Fingerprint ID is not linked to active staff");
    error.status = 404;
    throw error;
  }

  const key = dateKey(scannedAt);
  let attendance = await Attendance.findOne({ staff: staff._id, date: key });
  if (!attendance) {
    attendance = new Attendance({
      staff: staff._id,
      staffId: staff.staffId,
      staffName: staff.name,
      date: key,
      shift: staff.assignedShift._id,
      shiftName: staff.assignedShift.name,
      pump: staff.assignedPump._id,
      pumpNumber: staff.assignedPump.number
    });
  }

  const next = nextEventType(attendance);
  if (!next) {
    const error = new Error("All attendance events are already recorded for today");
    error.status = 409;
    throw error;
  }

  const [field, type, status] = next;
  attendance[field] = scannedAt;
  attendance.status = status;
  attendance.events.push({ type, time: scannedAt, source: "biometric" });
  recalculate(attendance, staff.assignedShift, scannedAt);
  await attendance.save();

  if (type === "Join Duty" && attendance.lateMinutes > 0) {
    await createNotification("Late Entry", staff, `${staff.name} is late by ${attendance.lateMinutes} minutes`, key);
  }
  if (type === "Exit Duty" && attendance.earlyExitMinutes > 0) {
    await createNotification("Early Exit", staff, `${staff.name} left early by ${attendance.earlyExitMinutes} minutes`, key);
  }
  if (type === "Exit Duty" && attendance.netWorkingMinutes > 12 * 60) {
    await createNotification("Overtime", staff, `${staff.name} crossed 12 hours of net work`, key);
  }

  return attendance.populate(["staff", "shift", "pump"]);
}

export async function manualCorrection(id, payload) {
  const attendance = await Attendance.findById(id).populate("shift");
  if (!attendance) {
    const error = new Error("Attendance not found");
    error.status = 404;
    throw error;
  }

  ["joinDuty", "lunchOut", "lunchIn", "exitDuty"].forEach((field) => {
    if (payload[field] !== undefined) attendance[field] = payload[field] ? new Date(payload[field]) : null;
  });
  if (payload.pump) attendance.pump = payload.pump;
  if (payload.pumpNumber) attendance.pumpNumber = payload.pumpNumber;
  attendance.events.push({ type: "Manual Correction", time: new Date(), source: "manual", note: payload.note });
  const eventDate = attendance.joinDuty || new Date(attendance.date);
  recalculate(attendance, attendance.shift, eventDate);
  attendance.status = attendance.exitDuty ? "Off Duty" : attendance.lunchOut && !attendance.lunchIn ? "On Lunch Break" : "On Duty";
  await attendance.save();
  return attendance;
}


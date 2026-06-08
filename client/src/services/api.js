import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function downloadUrl(path) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  return `${base}${path}${path.includes("?") ? "&" : "?"}token=${token || ""}`;
}

const shifts = [
  { _id: "shift-morning", name: "Morning Shift", startTime: "06:00", endTime: "18:00", active: true },
  { _id: "shift-night", name: "Night Shift", startTime: "18:00", endTime: "06:00", active: true }
];

const pumps = Array.from({ length: 6 }, (_, index) => ({
  _id: `pump-${index + 1}`,
  number: String(index + 1),
  label: `Pump ${index + 1}`,
  active: true
}));

const staffSeed = [
  { _id: "staff-1", staffId: "STF0001", name: "Rahul Das", mobile: "9000000001", address: "Station Road", designation: "Nozzleman", fingerprintId: "FP1001", assignedShift: shifts[0], assignedPump: pumps[0], joiningDate: "2025-01-10", active: true },
  { _id: "staff-2", staffId: "STF0002", name: "Amit Roy", mobile: "9000000002", address: "Market Para", designation: "Cashier", fingerprintId: "FP1002", assignedShift: shifts[0], assignedPump: pumps[1], joiningDate: "2025-02-15", active: true },
  { _id: "staff-3", staffId: "STF0003", name: "Sanjay Pal", mobile: "9000000003", address: "North Block", designation: "Supervisor", fingerprintId: "FP1003", assignedShift: shifts[1], assignedPump: pumps[2], joiningDate: "2024-11-20", active: true }
];

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function demoStaff() {
  return readStore("demo_staff", staffSeed);
}

export function demoShifts() {
  return readStore("demo_shifts", shifts);
}

export function demoPumps() {
  return readStore("demo_pumps", pumps);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function demoAttendance() {
  return readStore("demo_attendance", [
    {
      _id: "att-1",
      staffName: "Rahul Das",
      date: today(),
      shiftName: "Morning Shift",
      pumpNumber: "1",
      joinDuty: `${today()}T06:08:00`,
      lunchOut: `${today()}T13:00:00`,
      lunchIn: `${today()}T13:30:00`,
      exitDuty: "",
      netWorkingMinutes: 382,
      lateMinutes: 8,
      earlyExitMinutes: 0,
      status: "On Duty"
    },
    {
      _id: "att-2",
      staffName: "Amit Roy",
      date: today(),
      shiftName: "Morning Shift",
      pumpNumber: "2",
      joinDuty: `${today()}T05:58:00`,
      lunchOut: `${today()}T12:45:00`,
      lunchIn: "",
      exitDuty: "",
      netWorkingMinutes: 407,
      lateMinutes: 0,
      earlyExitMinutes: 0,
      status: "On Lunch Break"
    }
  ]);
}

export function mockFor(path) {
  if (path.startsWith("/staff")) return demoStaff();
  if (path.startsWith("/shifts")) return demoShifts();
  if (path.startsWith("/pumps")) return demoPumps();
  if (path.startsWith("/attendance/live-status")) {
    const attendance = demoAttendance();
    return demoStaff().map((person) => {
      const row = attendance.find((item) => item.staffName === person.name);
      return {
        staff: person._id,
        name: person.name,
        shift: person.assignedShift?.name,
        pumpNumber: person.assignedPump?.number,
        status: row?.status || "Off Duty"
      };
    });
  }
  if (path.startsWith("/reports/daily") || path.startsWith("/attendance")) return demoAttendance();
  if (path.startsWith("/dashboard/summary")) {
    const attendance = demoAttendance();
    const staff = demoStaff();
    return {
      cards: {
        totalStaff: staff.length,
        presentToday: attendance.length,
        absentToday: Math.max(0, staff.length - attendance.length),
        morningShiftStaff: staff.filter((item) => item.assignedShift?.name === "Morning Shift").length,
        nightShiftStaff: staff.filter((item) => item.assignedShift?.name === "Night Shift").length,
        staffOnDuty: attendance.filter((item) => item.status === "On Duty").length,
        staffOnLunch: attendance.filter((item) => item.status === "On Lunch Break").length,
        lateEntriesToday: attendance.filter((item) => item.lateMinutes > 0).length,
        earlyExitsToday: attendance.filter((item) => item.earlyExitMinutes > 0).length
      },
      charts: {
        dailyAttendance: [{ name: "Present", value: attendance.length }, { name: "Absent", value: Math.max(0, staff.length - attendance.length) }],
        shiftWise: demoShifts().map((shift) => ({ name: shift.name, value: staff.filter((item) => item.assignedShift?.name === shift.name).length })),
        pumpWise: demoPumps().map((pump) => ({ name: `Pump ${pump.number}`, value: staff.filter((item) => item.assignedPump?.number === pump.number).length }))
      }
    };
  }
  return null;
}

export async function getOrMock(path) {
  if (isDemoMode) return mockFor(path);
  try {
    const { data } = await api.get(path);
    return data;
  } catch {
    return mockFor(path);
  }
}

export function saveMockStaff(payload, id) {
  const list = demoStaff();
  const shift = demoShifts().find((item) => item._id === payload.assignedShift) || payload.assignedShift;
  const pump = demoPumps().find((item) => item._id === payload.assignedPump) || payload.assignedPump;
  if (id) {
    const updated = list.map((item) => item._id === id ? { ...payload, _id: id, staffId: item.staffId, assignedShift: shift, assignedPump: pump } : item);
    writeStore("demo_staff", updated);
    return updated;
  }
  const created = { ...payload, _id: `staff-${Date.now()}`, staffId: `STF${String(list.length + 1).padStart(4, "0")}`, assignedShift: shift, assignedPump: pump, active: true };
  const updated = [created, ...list];
  writeStore("demo_staff", updated);
  return updated;
}

export function deleteMockStaff(id) {
  const updated = demoStaff().filter((item) => item._id !== id);
  writeStore("demo_staff", updated);
  return updated;
}

export function saveMockShift(payload) {
  const updated = demoShifts().map((item) => item.name === payload.name ? { ...item, ...payload } : item);
  writeStore("demo_shifts", updated);
  return updated;
}

export function saveMockPump(payload, id) {
  const list = demoPumps();
  const updated = id ? list.map((item) => item._id === id ? { ...item, ...payload } : item) : [{ ...payload, _id: `pump-${Date.now()}`, active: true }, ...list];
  writeStore("demo_pumps", updated);
  return updated;
}

export function mockFingerprint(fingerprintId) {
  const person = demoStaff().find((item) => item.fingerprintId === fingerprintId);
  if (!person) throw new Error("Fingerprint ID not found in demo data");
  const key = `demo_scan_${fingerprintId}_${today()}`;
  const count = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(count));
  const type = ["Join Duty", "Lunch Out", "Lunch In", "Exit Duty"][Math.min(count - 1, 3)];
  return { staffName: person.name, events: [{ type }] };
}

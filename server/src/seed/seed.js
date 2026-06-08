import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import User from "../models/User.js";
import Shift from "../models/Shift.js";
import Pump from "../models/Pump.js";
import Staff from "../models/Staff.js";

dotenv.config();

await connectDb();

await Promise.all([User.deleteMany({}), Shift.deleteMany({}), Pump.deleteMany({}), Staff.deleteMany({})]);

const passwordHash = await bcrypt.hash("Nxghosh@$45", 10);
await User.create({ username: "ghoshbrothers", passwordHash, role: "Super Admin" });
await User.create({ username: "manager", passwordHash, role: "Manager" });

const morning = await Shift.create({ name: "Morning Shift", startTime: "06:00", endTime: "18:00" });
const night = await Shift.create({ name: "Night Shift", startTime: "18:00", endTime: "06:00" });
const pumps = await Pump.insertMany(Array.from({ length: 6 }, (_, i) => ({ number: String(i + 1), label: `Pump ${i + 1}` })));

await Staff.create([
  { name: "Rahul Das", mobile: "9000000001", address: "Station Road", designation: "Nozzleman", fingerprintId: "FP1001", assignedShift: morning._id, assignedPump: pumps[0]._id, joiningDate: new Date("2025-01-10"), shiftHistory: [{ shift: morning._id, pump: pumps[0]._id, note: "Initial assignment" }] },
  { name: "Amit Roy", mobile: "9000000002", address: "Market Para", designation: "Cashier", fingerprintId: "FP1002", assignedShift: morning._id, assignedPump: pumps[1]._id, joiningDate: new Date("2025-02-15"), shiftHistory: [{ shift: morning._id, pump: pumps[1]._id, note: "Initial assignment" }] },
  { name: "Sanjay Pal", mobile: "9000000003", address: "North Block", designation: "Supervisor", fingerprintId: "FP1003", assignedShift: night._id, assignedPump: pumps[2]._id, joiningDate: new Date("2024-11-20"), shiftHistory: [{ shift: night._id, pump: pumps[2]._id, note: "Initial assignment" }] }
]);

console.log("Seed complete. Login ghoshbrothers/Nxghosh@$45");
process.exit(0);

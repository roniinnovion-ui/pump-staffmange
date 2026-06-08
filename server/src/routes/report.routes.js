import { Router } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import { requireAuth } from "../middleware/auth.js";
import { formatMinutes } from "../utils/time.js";

const router = Router();
router.use(requireAuth);

function reportFilter(query) {
  const filter = {};
  if (query.date) filter.date = query.date;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }
  if (query.shift) filter.shift = query.shift;
  if (query.staff) filter.staff = query.staff;
  if (query.pump) filter.pump = query.pump;
  return filter;
}

async function rows(query) {
  return Attendance.find(reportFilter(query)).populate("staff shift pump").sort({ date: -1, staffName: 1 });
}

router.get("/daily", async (req, res) => res.json(await rows(req.query)));

router.get("/monthly", async (req, res) => {
  const from = req.query.month ? `${req.query.month}-01` : req.query.from;
  const to = req.query.month ? `${req.query.month}-31` : req.query.to;
  const data = await rows({ ...req.query, from, to });
  const grouped = new Map();
  data.forEach((row) => {
    const id = String(row.staff?._id || row.staff);
    const current = grouped.get(id) || {
      staffName: row.staffName,
      presentDays: 0,
      lateEntries: 0,
      earlyExits: 0,
      dutyMinutes: 0
    };
    current.presentDays += row.joinDuty ? 1 : 0;
    current.lateEntries += row.lateMinutes > 0 ? 1 : 0;
    current.earlyExits += row.earlyExitMinutes > 0 ? 1 : 0;
    current.dutyMinutes += row.netWorkingMinutes || 0;
    grouped.set(id, current);
  });
  res.json(Array.from(grouped.values()).map((item) => ({ ...item, dutyHours: formatMinutes(item.dutyMinutes) })));
});

router.get("/late-entry", async (req, res) => res.json((await rows(req.query)).filter((row) => row.lateMinutes > 0)));
router.get("/early-exit", async (req, res) => res.json((await rows(req.query)).filter((row) => row.earlyExitMinutes > 0)));

router.get("/export/excel", async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");
  sheet.columns = [
    { header: "Staff", key: "staffName", width: 24 },
    { header: "Date", key: "date", width: 14 },
    { header: "Shift", key: "shiftName", width: 18 },
    { header: "Pump", key: "pumpNumber", width: 10 },
    { header: "Join", key: "join", width: 22 },
    { header: "Lunch Out", key: "lunchOut", width: 22 },
    { header: "Lunch In", key: "lunchIn", width: 22 },
    { header: "Exit", key: "exit", width: 22 },
    { header: "Net Hours", key: "net", width: 14 }
  ];
  (await rows(req.query)).forEach((row) => sheet.addRow({
    staffName: row.staffName,
    date: row.date,
    shiftName: row.shiftName,
    pumpNumber: row.pumpNumber,
    join: row.joinDuty,
    lunchOut: row.lunchOut,
    lunchIn: row.lunchIn,
    exit: row.exitDuty,
    net: formatMinutes(row.netWorkingMinutes)
  }));
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=attendance-report.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});

router.get("/export/pdf", async (req, res) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=attendance-report.pdf");
  doc.pipe(res);
  doc.fontSize(16).text("Attendance Report", { underline: true });
  doc.moveDown();
  (await rows(req.query)).forEach((row) => {
    doc.fontSize(9).text(`${row.date} | ${row.staffName} | ${row.shiftName} | Pump ${row.pumpNumber} | Net ${formatMinutes(row.netWorkingMinutes)}`);
  });
  doc.end();
});

router.get("/absent", async (req, res) => {
  const date = req.query.date;
  const presentIds = (await Attendance.find({ date }).select("staff")).map((row) => String(row.staff));
  const staff = await Staff.find({ active: true });
  res.json(staff.filter((person) => !presentIds.includes(String(person._id))));
});

export default router;


import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getOrMock } from "../services/api.js";
import { Card } from "../components/ui.jsx";

const palette = ["#0f766e", "#f59e0b", "#2563eb", "#dc2626", "#7c3aed", "#16a34a"];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    getOrMock("/dashboard/summary").then(setSummary);
  }, []);

  if (!summary) return <Card>Loading dashboard...</Card>;
  const cards = [
    ["Total Staff", summary.cards.totalStaff],
    ["Present Today", summary.cards.presentToday],
    ["Absent Today", summary.cards.absentToday],
    ["Morning Shift", summary.cards.morningShiftStaff],
    ["Night Shift", summary.cards.nightShiftStaff],
    ["On Duty", summary.cards.staffOnDuty],
    ["On Lunch", summary.cards.staffOnLunch],
    ["Late Entries", summary.cards.lateEntriesToday],
    ["Early Exits", summary.cards.earlyExitsToday],
    ["Pending Attendance", summary.cards.pendingAttendance || 0]
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="mb-3 font-semibold">Shift-wise Attendance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.charts.shiftWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Daily Attendance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.charts.dailyAttendance} dataKey="value" nameKey="name" outerRadius={95} label>
                  {summary.charts.dailyAttendance.map((_, i) => <Cell key={i} fill={palette[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Pump-wise Staff Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.charts.pumpWise}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

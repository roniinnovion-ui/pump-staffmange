import { Download, Filter, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Input, Select } from "../components/ui.jsx";
import { api, deleteMockAttendance, getOrMock, isDemoMode, saveMockAttendance } from "../services/api.js";

function time(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function minutes(value) {
  const h = Math.floor((value || 0) / 60);
  const m = (value || 0) % 60;
  return `${h}h ${m}m`;
}

function toTimeInput(value) {
  return value ? new Date(value).toTimeString().slice(0, 5) : "";
}

function fromTimeInput(date, value) {
  return value ? `${date}T${value}:00` : "";
}

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ date: today, staff: "", shift: "", pump: "" });
  const [rows, setRows] = useState([]);
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
  const load = () => getOrMock(`/reports/daily?${qs}`).then(setRows);
  useEffect(() => {
    Promise.all([getOrMock("/staff"), getOrMock("/shifts"), getOrMock("/pumps")]).then(([a, b, c]) => {
      setStaff(a);
      setShifts(b);
      setPumps(c);
    });
  }, []);
  useEffect(() => { load(); }, [qs]);

  const download = (kind) => {
    const token = localStorage.getItem("token") || "";
    const join = qs ? `${qs}&token=${token}` : `token=${token}`;
    window.open(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/export/${kind}?${join}`, "_blank");
  };

  function startEdit(row) {
    setEditing(row._id);
    setEditForm({
      joinDuty: toTimeInput(row.joinDuty),
      lunchOut: toTimeInput(row.lunchOut),
      lunchIn: toTimeInput(row.lunchIn),
      exitDuty: toTimeInput(row.exitDuty)
    });
  }

  async function saveRow(row) {
    const payload = {
      joinDuty: fromTimeInput(row.date, editForm.joinDuty),
      lunchOut: fromTimeInput(row.date, editForm.lunchOut),
      lunchIn: fromTimeInput(row.date, editForm.lunchIn),
      exitDuty: fromTimeInput(row.date, editForm.exitDuty),
      note: "Report correction"
    };
    try {
      if (!isDemoMode) await api.put(`/attendance/${row._id}/correct`, payload);
      else setRows(saveMockAttendance(row._id, payload));
    } catch {
      setRows(saveMockAttendance(row._id, payload));
    }
    setEditing(null);
    setEditForm({});
    if (!isDemoMode) load();
  }

  async function deleteRow(id) {
    try {
      if (!isDemoMode) await api.delete(`/attendance/${id}`);
      else setRows(deleteMockAttendance(id));
    } catch {
      setRows(deleteMockAttendance(id));
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid gap-3 md:grid-cols-5">
          <Input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          <Select value={filters.staff} onChange={(e) => setFilters({ ...filters, staff: e.target.value })}><option value="">All Staff</option>{staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</Select>
          <Select value={filters.shift} onChange={(e) => setFilters({ ...filters, shift: e.target.value })}><option value="">All Shifts</option>{shifts.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</Select>
          <Select value={filters.pump} onChange={(e) => setFilters({ ...filters, pump: e.target.value })}><option value="">All Pumps</option>{pumps.map((p) => <option key={p._id} value={p._id}>Pump {p.number}</option>)}</Select>
          <Button onClick={load}><Filter size={16} /> Apply</Button>
        </div>
      </Card>
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold">Attendance Reports</h3>
          <div className="flex gap-2"><Button variant="ghost" onClick={() => download("pdf")}><Download size={16} /> PDF</Button><Button variant="ghost" onClick={() => download("excel")}><Download size={16} /> Excel</Button></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-2">Staff</th><th>Date</th><th>Shift</th><th>Pump</th><th>Join</th><th>Lunch Out</th><th>Lunch In</th><th>Exit</th><th>Net</th><th>Late</th><th>Early</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-medium">{row.staffName}</td>
                  <td>{row.date}</td>
                  <td>{row.shiftName}</td>
                  <td>Pump {row.pumpNumber}</td>
                  <td>{editing === row._id ? <Input type="time" value={editForm.joinDuty} onChange={(e) => setEditForm({ ...editForm, joinDuty: e.target.value })} /> : time(row.joinDuty)}</td>
                  <td>{editing === row._id ? <Input type="time" value={editForm.lunchOut} onChange={(e) => setEditForm({ ...editForm, lunchOut: e.target.value })} /> : time(row.lunchOut)}</td>
                  <td>{editing === row._id ? <Input type="time" value={editForm.lunchIn} onChange={(e) => setEditForm({ ...editForm, lunchIn: e.target.value })} /> : time(row.lunchIn)}</td>
                  <td>{editing === row._id ? <Input type="time" value={editForm.exitDuty} onChange={(e) => setEditForm({ ...editForm, exitDuty: e.target.value })} /> : time(row.exitDuty)}</td>
                  <td>{minutes(row.netWorkingMinutes)}</td>
                  <td>{row.lateMinutes || 0}m</td>
                  <td>{row.earlyExitMinutes || 0}m</td>
                  <td>
                    {editing === row._id ? (
                      <div className="flex gap-2">
                        <Button title="Save" onClick={() => saveRow(row)}><Save size={15} /></Button>
                        <Button title="Cancel" variant="ghost" onClick={() => setEditing(null)}><X size={15} /></Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button title="Edit" variant="ghost" onClick={() => startEdit(row)}><Pencil size={15} /></Button>
                        <Button title="Delete" variant="ghost" onClick={() => deleteRow(row._id)}><Trash2 size={15} /></Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

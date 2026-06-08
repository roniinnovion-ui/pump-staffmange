import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "../components/ui.jsx";
import { api, getOrMock, saveMockShift } from "../services/api.js";

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({ name: "Morning Shift", startTime: "06:00", endTime: "18:00" });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canEdit = user.role === "Super Admin";

  const load = () => getOrMock("/shifts").then(setShifts);
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const existing = shifts.find((shift) => shift.name === form.name);
    try {
      if (existing) await api.put(`/shifts/${existing._id}`, form);
      else await api.post("/shifts", form);
    } catch {
      setShifts(saveMockShift(form));
    }
    load();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      {canEdit && (
        <Card>
          <h3 className="mb-3 font-semibold">Create or Edit Shift</h3>
          <form onSubmit={save} className="space-y-3">
            <select className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
              <option>Morning Shift</option>
              <option>Night Shift</option>
            </select>
            <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <Button className="w-full"><Save size={16} /> Save Shift</Button>
          </form>
        </Card>
      )}
      <Card>
        <h3 className="mb-3 font-semibold">Shift Management</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {shifts.map((shift) => (
            <button key={shift._id} onClick={() => setForm(shift)} className="rounded border border-slate-200 p-4 text-left dark:border-slate-800">
              <p className="font-semibold">{shift.name}</p>
              <p className="mt-2 text-sm text-slate-500">{shift.startTime} to {shift.endTime}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

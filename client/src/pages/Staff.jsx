import { Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Select } from "../components/ui.jsx";
import { api, deleteMockStaff, getOrMock, saveMockStaff } from "../services/api.js";

const empty = { name: "", mobile: "", designation: "", fingerprintId: "", assignedShift: "", assignedPump: "", joiningDate: "" };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [form, setForm] = useState(empty);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canEdit = user.role === "Super Admin";

  const load = () => Promise.all([getOrMock(`/staff?q=${q}`), getOrMock("/shifts"), getOrMock("/pumps")]).then(([a, b, c]) => {
    setStaff(a);
    setShifts(b);
    setPumps(c);
  });
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    try {
      if (edit) await api.put(`/staff/${edit}`, form);
      else await api.post("/staff", form);
    } catch {
      setStaff(saveMockStaff(form, edit));
    }
    setForm(empty);
    setEdit(null);
    load();
  }

  function startEdit(row) {
    setEdit(row._id);
    setForm({ ...row, assignedShift: row.assignedShift?._id, assignedPump: row.assignedPump?._id, joiningDate: row.joiningDate?.slice(0, 10) });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      {canEdit && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Plus size={18} /> {edit ? "Edit Staff" : "Add Staff"}</h3>
          <form onSubmit={save} className="space-y-3">
            <Input placeholder="Staff Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
            <Input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
            <Input placeholder="Fingerprint ID" value={form.fingerprintId} onChange={(e) => setForm({ ...form, fingerprintId: e.target.value })} required />
            <Select value={form.assignedShift} onChange={(e) => setForm({ ...form, assignedShift: e.target.value })} required>
              <option value="">Select Shift</option>
              {shifts.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
            <Select value={form.assignedPump} onChange={(e) => setForm({ ...form, assignedPump: e.target.value })} required>
              <option value="">Select Pump</option>
              {pumps.map((p) => <option key={p._id} value={p._id}>Pump {p.number}</option>)}
            </Select>
            <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required />
            <Button className="w-full">{edit ? "Update Staff" : "Create Staff"}</Button>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold">Staff Management</h3>
          <div className="flex gap-2">
            <Input placeholder="Search staff" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button type="button" onClick={load}><Search size={16} /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-2">ID</th><th>Name</th><th>Mobile</th><th>Shift</th><th>Pump</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {staff.map((row) => (
                <tr key={row._id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-medium">{row.staffId}</td>
                  <td>{row.name}<div className="text-xs text-slate-500">{row.designation}</div></td>
                  <td>{row.mobile}</td>
                  <td>{row.assignedShift?.name}</td>
                  <td>Pump {row.assignedPump?.number}</td>
                  <td><Badge tone={row.active ? "green" : "red"}>{row.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="text-right">
                    {canEdit && <div className="flex justify-end gap-2"><Button variant="ghost" title="Edit" onClick={() => startEdit(row)}><Pencil size={15} /></Button><Button variant="ghost" title="Toggle active" onClick={() => api.put(`/staff/${row._id}`, { ...row, assignedShift: row.assignedShift?._id, assignedPump: row.assignedPump?._id, active: !row.active }).catch(() => saveMockStaff({ ...row, assignedShift: row.assignedShift?._id, assignedPump: row.assignedPump?._id, active: !row.active }, row._id)).then(load)}><Power size={15} /></Button><Button variant="ghost" title="Delete" onClick={() => api.delete(`/staff/${row._id}`).catch(() => deleteMockStaff(row._id)).then(load)}><Trash2 size={15} /></Button></div>}
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

import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "../components/ui.jsx";
import { api, getOrMock, saveMockPump } from "../services/api.js";

export default function Pumps() {
  const [pumps, setPumps] = useState([]);
  const [form, setForm] = useState({ number: "", label: "" });
  const [edit, setEdit] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canEdit = user.role === "Super Admin";
  const load = () => getOrMock("/pumps").then(setPumps);
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    try {
      if (edit) await api.put(`/pumps/${edit}`, form);
      else await api.post("/pumps", form);
    } catch {
      setPumps(saveMockPump(form, edit));
    }
    setForm({ number: "", label: "" });
    setEdit(null);
    load();
  }

  return (
    <div className="space-y-5">
      {canEdit && (
        <Card>
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input placeholder="Pump number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
            <Input placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Button>{edit ? <Save size={16} /> : <Plus size={16} />} {edit ? "Save" : "Add Pump"}</Button>
          </form>
        </Card>
      )}
      <Card>
        <h3 className="mb-4 font-semibold">Pump Management</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pumps.map((pump) => (
            <button key={pump._id} onClick={() => { setEdit(pump._id); setForm({ number: pump.number, label: pump.label || "" }); }} className="rounded border border-slate-200 p-5 text-left dark:border-slate-800">
              <p className="text-2xl font-semibold">Pump {pump.number}</p>
              <p className="mt-1 text-sm text-slate-500">{pump.label || "Fuel dispensing point"}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card } from "../components/ui.jsx";
import { getOrMock } from "../services/api.js";

function tone(status) {
  if (status === "On Duty") return "green";
  if (status === "On Lunch Break") return "yellow";
  if (status === "Pending Attendance") return "yellow";
  return "red";
}

export default function LiveStatus() {
  const [rows, setRows] = useState([]);
  const load = () => getOrMock("/attendance/live-status").then(setRows);
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Live Staff Status</h3>
        <Button variant="ghost" onClick={load}><RefreshCw size={16} /> Refresh</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.staff} className="rounded border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-slate-500">{row.shift} | Pump {row.pumpNumber}</p>
              </div>
              <Badge tone={tone(row.status)}>{row.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

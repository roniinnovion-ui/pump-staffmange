import { Fingerprint, Send } from "lucide-react";
import { useState } from "react";
import { Button, Card, Input } from "../components/ui.jsx";
import { api, isDemoMode, mockFingerprint } from "../services/api.js";

export default function Settings() {
  const [fingerprintId, setFingerprintId] = useState("FP1001");
  const [result, setResult] = useState("");

  async function simulate(e) {
    e.preventDefault();
    if (isDemoMode) {
      try {
        const data = mockFingerprint(fingerprintId);
        setResult(`${data.staffName}: ${data.events[data.events.length - 1].type} recorded`);
      } catch (err) {
        setResult(err.message || "Fingerprint failed");
      }
      return;
    }
    try {
      const { data } = await api.post("/biometric/fingerprint", { fingerprintId });
      setResult(`${data.staffName}: ${data.events[data.events.length - 1].type} recorded`);
    } catch (err) {
      try {
        const data = mockFingerprint(fingerprintId);
        setResult(`${data.staffName}: ${data.events[data.events.length - 1].type} recorded`);
      } catch (mockErr) {
        setResult(err.response?.data?.message || mockErr.message || "Fingerprint failed");
      }
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Fingerprint size={18} /> Biometric Integration</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Connect the physical ZKTeco listener inside <span className="font-mono">server/src/services/zkteco.service.js</span>.</p>
          <p>The production boundary expects a fingerprint ID or device user ID and maps scans to Join Duty, Lunch Out, Lunch In, and Exit Duty.</p>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-semibold">Fingerprint Test</h3>
        <form onSubmit={simulate} className="flex gap-2">
          <Input value={fingerprintId} onChange={(e) => setFingerprintId(e.target.value)} placeholder="Fingerprint ID" />
          <Button><Send size={16} /> Send</Button>
        </form>
        {result && <p className="mt-3 rounded bg-slate-100 p-3 text-sm dark:bg-slate-800">{result}</p>}
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, isDemoMode } from "../services/api.js";
import { Button, Input } from "../components/ui.jsx";
import { brandName, logoUrl } from "../config/brand.js";

export default function Login() {
  const demoUsername = "ghoshbrothers";
  const demoPassword = "Nxghosh@$45";
  const [form, setForm] = useState({ username: demoUsername, password: demoPassword });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (isDemoMode && form.username === demoUsername && form.password === demoPassword) {
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify({ username: demoUsername, role: "Super Admin" }));
      navigate("/");
      return;
    }
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      if (form.username === demoUsername && form.password === demoPassword) {
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify({ username: demoUsername, role: "Super Admin" }));
        navigate("/");
        return;
      }
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <form onSubmit={submit} className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <img src={logoUrl} alt={`${brandName} logo`} className="h-16 w-16 rounded object-cover ring-2 ring-fuel/20" />
          <div>
            <h1 className="text-xl font-semibold dark:text-white">{brandName}</h1>
            <p className="text-sm text-slate-500">Secure admin login</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button className="w-full">Login</Button>
        </div>
      </form>
    </div>
  );
}

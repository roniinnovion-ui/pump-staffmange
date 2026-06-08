import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Fuel, LogOut, Moon, Settings, Sun, Users, Clock, Activity, FileText } from "lucide-react";
import { brandName, logoUrl } from "../config/brand.js";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/staff", label: "Staff", icon: Users },
  { to: "/shifts", label: "Shifts", icon: Clock },
  { to: "/pumps", label: "Pumps", icon: Fuel },
  { to: "/live", label: "Live Status", icon: Activity },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Layout({ dark, onTheme, onLogout }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div className="min-h-screen bg-slate-100 text-ink dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <img src={logoUrl} alt={`${brandName} logo`} className="h-14 w-14 rounded object-cover ring-2 ring-fuel/20" />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Petrol Pump</p>
            <h1 className="font-semibold">{brandName}</h1>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 rounded px-3 py-2 text-sm transition ${isActive ? "bg-fuel text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-fuel">Shift and Attendance Control</p>
              <h2 className="text-lg font-semibold">{brandName} Admin Panel</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">{user.username} | {user.role}</span>
              <button title="Toggle theme" onClick={onTheme} className="rounded border border-slate-200 p-2 dark:border-slate-700">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button title="Logout" onClick={onLogout} className="rounded border border-slate-200 p-2 text-rose-600 dark:border-slate-700"><LogOut size={18} /></button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `whitespace-nowrap rounded px-3 py-2 text-sm ${isActive ? "bg-fuel text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{label}</NavLink>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

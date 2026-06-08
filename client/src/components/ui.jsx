export function Card({ children, className = "" }) {
  return <div className={`rounded border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = variant === "ghost" ? "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" : "bg-fuel text-white";
  return <button className={`inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium transition hover:opacity-90 ${styles} ${className}`} {...props}>{children}</button>;
}

export function Input(props) {
  return <input className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-fuel dark:border-slate-700 dark:bg-slate-950" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-fuel dark:border-slate-700 dark:bg-slate-950" {...props}>{children}</select>;
}

export function Badge({ children, tone = "slate" }) {
  const map = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  };
  return <span className={`rounded px-2 py-1 text-xs font-medium ${map[tone]}`}>{children}</span>;
}

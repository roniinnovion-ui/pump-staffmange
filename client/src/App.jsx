import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Staff from "./pages/Staff.jsx";
import Shifts from "./pages/Shifts.jsx";
import Pumps from "./pages/Pumps.jsx";
import Reports from "./pages/Reports.jsx";
import LiveStatus from "./pages/LiveStatus.jsx";
import Settings from "./pages/Settings.jsx";
import Layout from "./components/Layout.jsx";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout dark={dark} onTheme={() => setDark((value) => !value)} onLogout={logout} />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="staff" element={<Staff />} />
        <Route path="shifts" element={<Shifts />} />
        <Route path="pumps" element={<Pumps />} />
        <Route path="reports" element={<Reports />} />
        <Route path="live" element={<LiveStatus />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}


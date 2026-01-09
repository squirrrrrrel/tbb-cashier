import React, { useEffect } from "react";
import LoginPage from "./pages/login/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import PosLayout from "./components/layout/PosLayout";
import Dashboard from "./pages/pos/Dashboard";
import Customers from "./pages/pos/Customers";
import Invoices from "./pages/pos/Invoices";
import Promotions from "./pages/pos/Promotions";
import Tables from "./pages/pos/Tables";
import LowStock from "./pages/pos/LowStock";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import { ReactNotifications } from "react-notifications-component";


const App = () => {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <div>Loading...</div>;
  return (
    <>
      <ReactNotifications />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected POS */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pos" element={<PosLayout />}>
            <Route index element={<Navigate to="/pos/dashboard" replace />} />
            <Route path="/pos/dashboard" element={<Dashboard />} />
            <Route path="/pos/customers" element={<Customers />} />
            <Route path="/pos/invoices" element={<Invoices />} />
            <Route path="/pos/promotions" element={<Promotions />} />
            <Route path="/pos/tables" element={<Tables />} />
            <Route path="/pos/lowstock" element={<LowStock />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;

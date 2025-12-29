import React from "react";
import LoginPage from "./pages/login/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import PosLayout from "./components/layout/PosLayout";
import Dashboard from "./pages/pos/Dashboard";
import Customers from "./pages/pos/Customers";
import Invoices from "./pages/pos/Invoices";
import Promotions from "./pages/pos/Promotions";
import Tables from "./pages/pos/Tables";
import LowStock from "./pages/pos/LowStock";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/pos" element={<PosLayout />}>
        <Route index element={<Navigate to="/pos/dashboard" replace />} />
        <Route path="/pos/dashboard" element={<Dashboard />} />
        <Route path="/pos/customers" element={<Customers />} />
        <Route path="/pos/invoices" element={<Invoices />} />
        <Route path="/pos/promotions" element={<Promotions />} />
        <Route path="/pos/tables" element={<Tables />} />
        <Route path="/pos/lowstock" element={<LowStock />} />
      </Route>
    </Routes>
  );
};

export default App;

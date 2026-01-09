import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import PosLayout from "./components/layout/PosLayout";
import Dashboard from "./pages/pos/Dashboard";
import Customers from "./pages/pos/Customers";
import Invoices from "./pages/pos/Invoices";
import Promotions from "./pages/pos/Promotions";
import Tables from "./pages/pos/Tables";
import LowStock from "./pages/pos/LowStock";
import ProtectedRoute from "./components/ProtectedRoute";
import OfflineLoader from "./components/OfflineLoader";

import { useAuthStore } from "./store/useAuthStore";
import { useNetworkStore } from "./store/useNetworkStore";
import { usePosStore } from "./store/usePosStore";

const App = () => {
  const authHydrate = useAuthStore((s) => s.hydrate);
  const posHydrate = usePosStore((s) => s.hydrate);

  const authHydrated = useAuthStore((s) => s.hydrated);
  const posHydrated = usePosStore((s) => s.hydrated);

  const initNetwork = useNetworkStore((s) => s.init);

  useEffect(() => {
    initNetwork();   // online/offline detection
    authHydrate();   // cookie-based auth
    posHydrate();    // IndexedDB hydration
  }, []);

  // 🔴 BLOCK UI UNTIL LOCAL DATA IS READY
  if (!authHydrated || !posHydrated) {
    return <OfflineLoader />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />

      {/* Protected POS */}
      <Route element={<ProtectedRoute />}>
        <Route path="/pos" element={<PosLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="tables" element={<Tables />} />
          <Route path="lowstock" element={<LowStock />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

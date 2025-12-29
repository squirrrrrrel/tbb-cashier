import { Outlet } from "react-router-dom";
import SideHeader from "./SideHeader";

export default function PosLayout() {
  return (
    <div className="flex h-screen">
      {/* SIDE NAV (FIXED) */}
      <SideHeader />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1">
        {/* DYNAMIC CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

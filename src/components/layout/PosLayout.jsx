import { Outlet } from "react-router-dom";
import SideHeader from "./SideHeader";
import LogoutPopUp from "./LogoutPopUp";
import { useState } from "react";

export default function PosLayout() {
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  return (
    <div className="flex h-screen">
      {/* SIDE NAV (FIXED) */}
      <SideHeader setIsLogoutClicked={setIsLogoutClicked} />

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1">
        {/* DYNAMIC CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {isLogoutClicked && (
        <LogoutPopUp setIsLogoutClicked={setIsLogoutClicked} />
      )}
    </div>
  );
}

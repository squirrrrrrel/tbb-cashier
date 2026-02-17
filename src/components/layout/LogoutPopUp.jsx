import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";

const LogoutPopUp = ({ setIsLogoutClicked }) => {
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((l) => l.logout);
  const user = useAuthStore((u) => u.user);
  const resetCart = useCartStore((s) => s.resetCart);

  useEffect(() => {
    // trigger animation after mount
    setOpen(true);
  }, []);

  const handleLogout = () => {
    try {
      logout();
      resetCart();
      setIsLogoutClicked(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="w-full h-screen bg-black/20 grid place-items-center absolute inset-0"
      onClick={() => setIsLogoutClicked(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          card w-[420px] bg-white rounded-md
          transform transition-all duration-300 ease-out p-6
          ${open ? "scale-100 opacity-100" : "scale-0 opacity-0"}
        `}
      >
        <h1 className="text-lg text-gray-700 font-semibold text-center mb-4">
          <p className="text-xl font-bold text-secondary">{user?.first_name} {user?.last_name}</p> Do you want to Logout?
        </h1>
        <div className="button-group gap-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="py-2 px-14 bg-primary text-white rounded-md cursor-pointer font-semibold"
          >
            Yes
          </button>
          <button
            onClick={() => setIsLogoutClicked(false)}
            className="py-1 px-14 bg-white border border-gray-300 rounded-md cursor-pointer font-semibold"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopUp;

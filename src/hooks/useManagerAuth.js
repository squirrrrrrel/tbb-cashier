import { useState } from "react";
import api from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";

export const useManagerAuth = () => {
    const [isVerifying, setIsVerifying] = useState(false);
    const { user } = useAuthStore(); // Get current cashier/outlet info

    const verify = async (username, password) => {
        setIsVerifying(true);
        try {
            const payload = {
                username,
                password,
                outletId: user?.outlet_id,
            };

            const res = await api.post("/user/verify-manager", payload);
            const data = res.data?.data || res.data;

            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || "Invalid Manager Credentials";
            return { success: false, message };
        } finally {
            setIsVerifying(false);
        }
    };

    return { verify, isVerifying };
};
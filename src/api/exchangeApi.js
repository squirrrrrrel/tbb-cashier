import api from "../utils/api";

export const exchangeOrderAPI = async (exchangeData) => {
  try {
    const res = await api.post("/exchange", exchangeData);

    return res.data;
  } catch (error) {
    // 🔴 Log for debugging
    console.error("❌ Exchange API failed:", error);

    // 🔴 Normalize error message
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Exchange request failed";

    // 🔴 Throw so UI can catch it
    throw new Error(message);
  }
};

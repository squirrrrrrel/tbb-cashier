import api from "../utils/api";

export const transferProductAPI = async (transferData) => {
  try {
    const res = await api.post("/shots-product/convert", transferData);
    return res.data;
  } catch (error) {
    console.error("Transfer API failed:", error);
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Transfer request failed";
    throw new Error(message);
  }
};
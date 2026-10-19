import api from "./axios.js";

export const getRevenueStats = async () => {
  try {
    const response = await api.get("/bills/revenue/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
};

export const getRevenueByMonth = async (months = 6) => {
  try {
    const response = await api.get(`/bills/revenue/by-month?months=${months}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue by month:", error);
    throw error;
  }
};

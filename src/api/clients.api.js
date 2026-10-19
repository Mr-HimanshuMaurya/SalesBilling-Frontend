import api from "./axios.js";

export const getClients = (params) =>
  api.get("/clients", { params }).then((r) => r.data.data);
export const getClient = (id) =>
  api.get(`/clients/${id}`).then((r) => r.data.data);
export const createClient = (data) =>
  api.post("/clients", data).then((r) => r.data.data);
export const updateClient = (id, data) =>
  api.put(`/clients/${id}`, data).then((r) => r.data.data);
export const deleteClient = (id) =>
  api.delete(`/clients/${id}`).then((r) => r.data.data);
export const getClientsWithoutBills = async () => {
  try {
    const response = await api.get("/clients/without-bills");
    return response.data;
  } catch (error) {
    console.error("Error fetching clients without bills:", error);
    throw error;
  }
};

export const getClientBillStatus = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/bill-status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client bill status:", error);
    throw error;
  }
};
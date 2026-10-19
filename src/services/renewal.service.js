import api from "../api/axios";

export const renewalService = {
  getSalesRenewals: (days = 30) =>
    api.get(`/renewals/sales/upcoming?days=${days}`),

  getAllRenewals: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append("days", params.days);
    if (params.salesPerson)
      queryParams.append("salesPerson", params.salesPerson);
    if (params.client) queryParams.append("client", params.client);
    if (params.service) queryParams.append("service", params.service);

    return api.get(`/renewals/all/upcoming?${queryParams.toString()}`);
  },

  getRenewalStats: () => api.get("/renewals/stats"),

  stopAlerts: (billId) => api.patch(`/bills/${billId}/stop-alerts`),

  getAlertStatus: (billId) => api.get(`/bills/${billId}/alert-status`),
};

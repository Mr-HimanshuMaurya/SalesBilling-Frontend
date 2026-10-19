import api from "./axios.js";

// Server APIs
export const getServers = (params) =>
  api.get("/servers", { params }).then((r) => r.data.data);
export const getServerById = (id) =>
  api.get(`/servers/${id}`).then((r) => r.data.data);
export const createServer = (data) =>
  api.post("/servers", data).then((r) => r.data.data);
export const updateServer = (id, data) =>
  api.put(`/servers/${id}`, data).then((r) => r.data.data);
export const deleteServer = (id) =>
  api.delete(`/servers/${id}`).then((r) => r.data.data);
export const toggleServerStatus = (id) =>
  api.patch(`/servers/${id}/toggle-status`).then((r) => r.data.data);

// Server Assignment APIs
export const getAssignments = (params) =>
  api.get("/server-assignments", { params }).then((r) => r.data.data);
export const getAssignmentById = (id) =>
  api.get(`/server-assignments/${id}`).then((r) => r.data.data);
export const createAssignment = (data) =>
  api.post("/server-assignments", data).then((r) => r.data.data);
export const updateAssignment = (id, data) =>
  api.put(`/server-assignments/${id}`, data).then((r) => r.data.data);
export const deleteAssignment = (id) =>
  api.delete(`/server-assignments/${id}`).then((r) => r.data.data);
export const getExpiringAssignments = (days = 7) =>
  api.get(`/server-assignments/expiring?days=${days}`).then((r) => r.data.data);

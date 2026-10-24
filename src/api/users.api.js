import api from "./axios.js";

export const getUsers = (params) =>
  api.get("/users", { params }).then((r) => r.data.data);
export const createUser = (data) =>
  api.post("/users", data).then((r) => r.data.data);
export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then((r) => r.data.data);
export const changeUserPassword = (id, newPassword) =>
  api.put(`/users/${id}/password`, { newPassword }).then((r) => r.data.data);
export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((r) => r.data.data);
export const toggleUserStatus = (id) =>
  api.post(`/users/${id}/toggle-status`).then((r) => r.data.data);

export const getUserSchedule = (userId) =>
  api.get(`/users/${userId}/schedule`).then((r) => r.data);

export const updateUserSchedule = (userId, data) =>
  api.put(`/users/${userId}/schedule`, data).then((r) => r.data);

export const getTransferPreview = (fromUserId) =>
  api.get(`/users/${fromUserId}/transfer-preview`).then((r) => r.data);

export const transferUserData = (fromUserId, data) =>
  api.post(`/users/${fromUserId}/transfer`, data).then((r) => r.data);

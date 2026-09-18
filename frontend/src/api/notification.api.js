import api from "./axios";

export const getNotifications = (params) => api.get("/api/notifications", { params });
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/api/notifications/read-all");

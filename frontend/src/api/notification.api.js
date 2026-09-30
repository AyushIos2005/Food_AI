import api from "./axios";

export const getNotifications = (params) => api.get("/notifications", { params });
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");

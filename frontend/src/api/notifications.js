import client from "./client";

// Backend (notification.controller.js) returns { success, data: [...], unreadCount, pagination }
// with `isRead`. The UI expects { notifications: [...] } with `read`, so normalise here.
const normalize = (n) => ({ ...n, read: n.isRead ?? n.read ?? false });

export const getNotifications = (params) =>
  client.get("/notifications", { params }).then((r) => ({
    ...r.data,
    notifications: (r.data.data || r.data.notifications || []).map(normalize),
  }));

export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  client.patch("/notifications/read-all").then((r) => r.data);

export const deleteNotification = (id) =>
  client.delete(`/notifications/${id}`).then((r) => r.data);
import client from "./client";

// Maps to backend/src/routes/notification.route.js -> mounted at /api/notifications
export const getNotifications = () => client.get("/notifications").then((r) => r.data);

export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  client.patch("/notifications/read-all").then((r) => r.data);

export const deleteNotification = (id) =>
  client.delete(`/notifications/${id}`).then((r) => r.data);

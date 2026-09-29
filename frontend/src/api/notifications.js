import client from "./client";

// Backend: src/routes/notification.route.js, mounted at /api/notifications.
//
// GET   /            => { success, data: Notification[], unreadCount,
//                         pagination: { page, limit, hasMore } }
// PATCH /:id/read    => { success, data: Notification }
// PATCH /read-all    => { success, message }
//
// Notification = { _id, recipient, sender, type, title, message, entityId,
//                  entityType, isRead, createdAt }
// type: LIKE | COMMENT | FOLLOW | RECIPE | BLOG | SYSTEM | SHARE | SAVE

export const getNotifications = (params, config = {}) =>
  client.get("/notifications", { params, ...config }).then((r) => r.data);

export const markNotificationRead = (id, config = {}) =>
  client.patch(`/notifications/${id}/read`, null, config).then((r) => r.data);

export const markAllNotificationsRead = (config = {}) =>
  client.patch("/notifications/read-all", null, config).then((r) => r.data);

import client from "./client";

// Backend: src/routes/feedback.route.js. The same router is mounted at
// /api/feedback, /api/complaint and /api/contactDeveloper, but its sub-paths
// are identical, so we always use the /api/feedback mount.
// Responses: { message, ... }. "complain" is users-only (403 for chefs).

export const giveFeedback = (rating, config = {}) =>
  client.post("/feedback/feedback", { rating }, config).then((r) => r.data);

export const submitComplaint = (complainMessage, config = {}) =>
  client.post("/feedback/complain", { complainMessage }, config).then((r) => r.data);

export const contactDeveloper = (data, config = {}) =>
  client.post("/feedback/contact-developer", data, config).then((r) => r.data);
// data: { fullname, address, contactno, email, reason }

import client from "./client";

// Maps to backend/src/routes/feedback.route.js
// NOTE: in backend/src/app.js this router is mounted at three different
// base paths (/api/feedback, /api/complaint, /api/contactDeveloper) but the
// router's own sub-paths are always the same, so the real, reachable routes are:
export const giveFeedback = (rating) =>
  client.post("/feedback/feedback", { rating }).then((r) => r.data);

export const submitComplaint = (complainMessage) =>
  client.post("/feedback/complain", { complainMessage }).then((r) => r.data);

export const contactDeveloper = (data) =>
  client.post("/feedback/contact-developer", data).then((r) => r.data);
// data: { fullname, address, contactno, email, reason }

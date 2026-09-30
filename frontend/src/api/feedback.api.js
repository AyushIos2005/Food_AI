import api from "./axios";

// Backend schema accepts { rating } only.
export const sendFeedback = (payload) => api.post("/feedback/feedback", payload);

// Users only (route uses verifyUser) — chefs get 403.
export const sendComplaint = (payload) => api.post("/complaint/complain", payload);

// { fullname, address, contactno, email, reason }
export const contactDeveloper = (payload) => api.post("/contactDeveloper/contact-developer", payload);

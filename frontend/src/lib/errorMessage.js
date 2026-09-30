import { FRIENDLY } from "../api/client";

// Turns an API error into a user-safe message.
// Errors coming from the central client (api/client.js) are already
// normalized (err.isApi, err.status, human-readable err.message); raw Axios
// errors (err.response) are still handled for safety.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.isApi && err.message) return err.message;

  const response = err?.response;
  if (!response) return FRIENDLY.network;

  const { status, data } = response;
  const serverMessage = typeof data?.message === "string" ? data.message : "";

  switch (status) {
    case 400:
    case 422:
      return serverMessage || "That didn't look right — please check the form.";
    case 401:
      return serverMessage || "Please login first.";
    case 403:
      return serverMessage || "You are not authorized to do that.";
    case 404:
      return serverMessage || "We couldn't find that.";
    case 409:
      return serverMessage || "That already exists.";
    case 429:
      return FRIENDLY.rateLimit;
    default:
      return status >= 500 ? FRIENDLY.server : serverMessage || fallback;
  }
}

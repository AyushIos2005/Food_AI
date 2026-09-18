// Turns an axios error into a friendly toast message.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err?.response) {
    return "Network error — check your connection and try again.";
  }
  const { status, data } = err.response;
  const serverMessage = data?.message;

  switch (status) {
    case 400:
      return serverMessage || "That didn't look right — please check the form.";
    case 401:
      return serverMessage || "Please login first.";
    case 403:
      return serverMessage || "You are not authorized to do that.";
    case 404:
      return serverMessage || "We couldn't find that.";
    case 409:
      return serverMessage || "That already exists.";
    case 500:
      return serverMessage || "Server error — please try again shortly.";
    default:
      return serverMessage || fallback;
  }
}

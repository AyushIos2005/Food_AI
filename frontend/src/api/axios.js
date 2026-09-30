// Legacy entry point kept so older imports keep working.
// There is ONE Axios client: ./client.js (baseURL = VITE_API_URL, which
// already includes "/api"). Request paths must NOT start with "/api".
export { default } from "./client";

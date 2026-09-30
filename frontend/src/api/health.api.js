import client, { SOCKET_URL } from "./client";

// Backend: GET /health (mounted at the server root, NOT under /api).
// An absolute URL overrides the client's /api baseURL.
export const getHealth = () => client.get(`${SOCKET_URL}/health`);

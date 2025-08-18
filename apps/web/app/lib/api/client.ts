import createClient from "openapi-fetch";

export const client = createClient({
  baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
});

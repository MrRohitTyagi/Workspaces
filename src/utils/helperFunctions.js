import axios from "axios";
// const baseUrl = import.meta.env.VITE_BE_BASE_URL;
const baseUrl = "https://workspaces-backend.vercel.app/api/v1/";

export async function caller(type, extendedUrl, body) {
  switch (type) {
    case "get":
      return await axios.get(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
        },
      });
    case "delete":
      return await axios.delete(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
        },
      });
    case "post":
      return await axios.post(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
        },
      });
    case "put":
      return await axios.put(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
        },
      });
    default:
      break;
  }
}

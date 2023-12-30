import axios from "axios";
const baseUrl = import.meta.env.VITE_BE_BASE_URL + "/api/v1/";

export async function caller(type, extendedUrl, body, headers = {}) {
  switch (type) {
    case "get":
      return await axios.get(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
          ...headers,
        },
      });
    case "delete":
      return await axios.delete(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
          ...headers,
        },
      });
    case "post":
      return await axios.post(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
          ...headers,
        },
      });
    case "put":
      return await axios.put(baseUrl + extendedUrl, body, {
        headers: {
          socket_id: window.socket_id,
          ...headers,
        },
      });
    default:
      break;
  }
}
export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function truncateText(text, maxLength) {
  if (text && text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }

  return text;
}

import axios from "axios";
const baseUrl = import.meta.env.VITE_BE_BASE_URL;

export async function caller(type, extendedUrl, body) {
  switch (type) {
    case "get":
      return await axios.get(baseUrl + extendedUrl, body);
    case "delete":
      return await axios.delete(baseUrl + extendedUrl, body);
    case "post":
      return await axios.post(baseUrl + extendedUrl, body);
    default:
      break;
  }
}

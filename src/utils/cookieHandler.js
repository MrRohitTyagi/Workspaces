import Cookies from "js-cookie";
let expires = 1;
// Function to set a cookie
export const setCookie = (value, name = "user_id") => {
  Cookies.set("user_id", value, { expires, path: "/" });
};

// Function to get a cookie value by name
export const getCookie = (name = "user_id") => {
  return Cookies.get(name);
};

// Function to delete a cookie by name
export const deleteCookie = (name = "user_id") => {
  Cookies.remove(name, { path: "/" });
};

// Function to update the value of a cookie
export const updateCookie = (newValue, name = "user_id") => {
  deleteCookie(name);
  setCookie(name, newValue, expires);
};

import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Axios instance that always sends the session cookie.
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;

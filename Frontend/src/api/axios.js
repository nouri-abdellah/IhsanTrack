import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const shouldSkipRedirect = Boolean(error?.config?.skipAuthRedirect);

    if (status === 401 && !shouldSkipRedirect && window.location.pathname !== "/user_sign_in") {
      window.location.assign("/user_sign_in");
    }

    return Promise.reject(error);
  }
);

export default api;

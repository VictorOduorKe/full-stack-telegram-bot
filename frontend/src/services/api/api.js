import axios from "axios";
import API_URL from "../config/config.js";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ Correct place for credentials
});

// Generic API function
export const api = async (endpoint, method = "GET", data = null, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: method.toLowerCase(),
      ...options,
    };

    // Attach data only for methods that support a body
    if (["post", "put", "patch", "delete"].includes(config.method) && data) {
      config.data = data;
    }

    const response = await apiClient(config);
    return response.data; // Axios automatically parses JSON
  } catch (error) {
    console.error("API request error:", error);
    throw error.response?.data || error;
  }
};
export default api;
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // ✅ Change port to 8000
});

export default axiosInstance;

import axios from "axios";

const API_URL = "http://localhost:8000/api";  // Backend URL

export const fetchTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};


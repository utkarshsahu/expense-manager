import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../utils/axiosInstance"; // ✅ Import axiosInstance
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ✅ Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionAnalytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current month

  // 🔹 Fetch transactions when component mounts
  useEffect(() => {
    axiosInstance.get("/api/transactions") // ✅ Uses axiosInstance
      .then((response) => setTransactions(response.data))
      .catch((error) => console.error("Error fetching transactions:", error));
  }, []);

  // 🔹 Trigger filtering when selectedDate changes
  useEffect(() => {
    const selectedMonth = selectedDate.getFullYear().toString() + '-' + (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Format YYYY-MM

    const filtered = transactions.filter(
      (txn) => txn.date.startsWith(selectedMonth)
    );

    setFilteredTransactions(filtered);
  }, [selectedDate, transactions]); // ✅ Re-runs when date OR transactions change

  // 🔹 Aggregate expenses by category
  const categoryTotals = filteredTransactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {});

  // 🔹 Prepare data for Pie Chart
  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800"],
      },
    ],
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Expense Analysis</h2>

      {/* Month-Year Picker */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Month:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)} // ✅ Triggers filtering
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center">
        <div style={{width: "300px", height: "300px"}}>
      {filteredTransactions.length > 0 ? (
        <Pie data={pieChartData} options={{maintainAspectRatio: false, responsive: true}} />
      ) : (
        <p className="text-gray-500">No expenses found for the selected month.</p>
      )}
      </div>
      </div>
    </div>
  );
};

export default TransactionAnalytics;


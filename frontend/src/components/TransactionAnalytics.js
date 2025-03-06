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
  const [debitTransactions, setDebitTransactions] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current month
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [clickedTransactions, setClickedTransactions] = useState([]);

  // 🔹 Trigger filtering when selectedDate changes
  useEffect(() => {

    axiosInstance.get("/api/transactions?month="+(selectedDate.getMonth()+1).toString()+"&year="+selectedDate.getFullYear().toString()+"&expense_type=debit")
    .then((response) => setDebitTransactions(response.data))
    .catch((error) => console.error("Error fetching transactions:", error));

    axiosInstance.get("/api/transactions?month="+(selectedDate.getMonth()+1).toString()+"&year="+selectedDate.getFullYear().toString()+"&expense_type=credit")
    .then((response) => setCreditTransactions(response.data))
    .catch((error) => console.error("Error fetching transactions:", error));

  }, [selectedDate]); // ✅ Re-runs when date OR transactions change

  // 🔹 Aggregate expenses by category
  const creditCategoryTotals = creditTransactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {});


  const debitCategoryTotals = debitTransactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {});


  const colorPalette = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800",
    "#8E44AD", "#E74C3C", "#2ECC71", "#3498DB", "#F39C12",
    "#1ABC9C", "#D35400", "#C0392B", "#7D3C98", "#2E86C1"
  ];
  // 🔹 Prepare data for Pie Chart
  const creditPieChartData = {
    labels: Object.keys(creditCategoryTotals),
    datasets: [
      {
        data: Object.values(creditCategoryTotals),
        backgroundColor: colorPalette.slice(0, Object.keys(creditCategoryTotals).length),
      },
    ],
  };

  const debitPieChartData = {
    labels: Object.keys(debitCategoryTotals),
    datasets: [
      {
        data: Object.values(debitCategoryTotals),
        backgroundColor: colorPalette.slice(0, Object.keys(debitCategoryTotals).length),
      },
    ],
  };

const handleChartClick = (event, elements, chart, transactions) => {
  if (elements.length > 0) {
    const index = elements[0].index;
    const category = chart.data.labels[index];

    // Filter transactions based on clicked category
    const clicked = transactions.filter(txn => txn.category === category);

    setSelectedCategory(category);
    setClickedTransactions(clicked);
  }
};

const creditChartOptions = {
  responsive: true, // Ensures the chart resizes with the container
  maintainAspectRatio: false, // Allows manual control of width/height
  plugins: {
    legend: {
      position: "right", // Moves the legend to the right
      labels: {
        font: {
          size: 14
        }
      }
    }
  },
  onClick: (event, elements, chart) => handleChartClick(event, elements, chart, creditTransactions)
};

const debitChartOptions = {
  responsive: true, // Ensures the chart resizes with the container
  maintainAspectRatio: false, // Allows manual control of width/height
  plugins: {
    legend: {
      position: "right", // Moves the legend to the right
      labels: {
        font: {
          size: 14
        }
      }
    }
  },
  onClick: (event, elements, chart) => handleChartClick(event, elements, chart, debitTransactions)
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
      <div style={{display: "flex", "justify-content": "space-between", gap: "20px"}}>
        <div style={{width: "500px", height: "500px"}}>
      {debitTransactions.length > 0 ? (
        <Pie data={debitPieChartData} options={debitChartOptions} />
      ) : (
        <p className="text-gray-500">No expenses found for the selected month.</p>
      )}
      </div>

        <div style={{width: "500px", height: "500px"}} className="w-1/2 bg-green-500 p-4 text-white">
      {creditTransactions.length > 0 ? (
        <Pie data={creditPieChartData} options={creditChartOptions} />
      ) : (
        <p className="text-gray-500">No expenses found for the selected month.</p>
      )}
      </div>
      </div>
      {selectedCategory && (
        <div>
            <h3>Transactions for {selectedCategory}</h3>
            <ul>
                {clickedTransactions.map((txn) => (
                    <li key={txn.id}>
                        {txn.date} - {txn.amount} - {txn.description}
                    </li>
                ))}
            </ul>
        </div>
        )}
    </div>
  );
};

export default TransactionAnalytics;


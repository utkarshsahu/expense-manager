import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TransactionTable = () => {
  // Function to format date to DD-MM-YYYY
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(50); // Default page size
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTransactions = async (month, year, pageNumber) => {
    setLoading(true);
    axiosInstance.get(`/api/transactions?page=${pageNumber}&size=${size}&month=${month}&year=${year}`)
      .then(response => setTransactions(response.data))
      .catch((error) => console.error("Error fetching transactions:", error));

    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions((selectedDate.getMonth()+1).toString(), selectedDate.getFullYear().toString(), page);

    if(categories.length == 0) {
    axiosInstance.get("/api/categories")
            .then(response => {
                if (Array.isArray(response.data)) {
                    const categoryNames = response.data.map(cat => cat.name); // Ensure extracting names
                    setCategories(categoryNames);
                }
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }
  }, [selectedDate, page]);

  const formatDate = (dateString) => (dateString ? format(new Date(dateString), "dd-MM-yyyy") : "");

  // Function to handle category change
  const handleCategoryChange = async (index, newCategory) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index].category = newCategory;
    setTransactions(updatedTransactions); // Update local state instantly

    try {
      await axiosInstance.put(`/api/update-category`, {
        description: updatedTransactions[index].description,
        category: newCategory,
      });
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Transactions</h2>
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
      <p>Loaded {transactions.length} rows</p>
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(page + 1)} disabled={transactions.length == 0}>Next</button>
      </div>
      {transactions.length === 0 ? (
          <p>No transactions available / Go to previous page</p>
      ): (

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Expense Type</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index}>
              <td>{formatDate(tx.date)}</td>
              <td>{tx.description}</td>
              <td>{tx.amount.toFixed(2)}</td>
              <td className={tx.expense_type === "debit" ? "withdrawal" : "deposit"}>
                {tx.expense_type}
              </td>
              <td>
                <select
                  value={tx.category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

    </div>
  );
};

export default TransactionTable;


import React, { useEffect, useState } from "react";
import { fetchTransactions } from "../services/api";
import TransactionTable from "../components/TransactionTable";
import UploadStatement from "../components/UploadStatement";

const Home = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getTransactions = async () => {
      const data = await fetchTransactions();
      setTransactions(data);
    };
    getTransactions();
  }, []);

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <UploadStatement setTransactions={setTransactions}/>
      <TransactionTable transactions={transactions} setTransactions={setTransactions}/>
    </div>
  );
};

export default Home;


import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Lazy load components for better performance
const UploadStatement = lazy(() => import('./components/UploadStatement'));
const TransactionTable = lazy(() => import('./components/TransactionTable'));
const TransactionAnalytics = lazy(() => import('./components/TransactionAnalytics'));
const CategoryManager = lazy(() => import('./components/CategoryManager'));

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/upload">Upload Statement</Link>
              </li>
              <li>
                <Link to="/transactions">Transaction Table</Link>
              </li>
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
              <li>
                <Link to="/categories">Manage Categories</Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main>
          <Suspense>
            <Routes>
              <Route path="/upload" element={<UploadStatement />} />
              <Route path="/transactions" element={<TransactionTable />} />
              <Route path="/analytics" element={<TransactionAnalytics />} />
              <Route path="/categories" element={<CategoryManager />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

// Home page component
function HomePage() {
  return (
    <div>
      <h1>Welcome to the Expense Manager</h1>
      <p>Select an option from the navigation above:</p>
      <ul>
        <li>Upload a new statement</li>
        <li>View all transactions</li>
        <li>View transaction analytics</li>
      </ul>
    </div>
  );
}

export default App;


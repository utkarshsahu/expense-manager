import React, { useState } from "react";
import axios from "axios";

const UploadStatement = ({setTransactions}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // Message for success/error
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus(""); // Reset message when new file is selected
  };

  // Fetch transactions after upload
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true); // Show loading state
    setUploadStatus("");

    try {
      const response = await axios.post("http://localhost:8000/api/upload-statement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus(`✅ Upload Successful: ${response.data.count} new rows added`);

      await fetchTransactions();
    } catch (error) {
      setUploadStatus("❌ Upload Failed. Please try again.");
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false); // Stop loading state
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Bank Statement</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {uploadStatus && <p className="upload-message">{uploadStatus}</p>}
    </div>
  );
};

export default UploadStatement;


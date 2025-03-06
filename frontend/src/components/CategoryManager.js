import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  // Fetch categories
  useEffect(() => {
    axiosInstance.get("/api/categories")
      .then(response => setCategories(response.data))
      .catch(error => console.error("Error fetching categories:", error));
  }, []);

  // Add a new category
  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axiosInstance.post("/api/add-category", { name: newCategory });
      setCategories([...categories, response.data]); // Update UI
      setNewCategory(""); // Clear input
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

    // Handle checkbox selection
    const handleCheckboxChange = (category) => {
        setSelectedCategories((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(category)) {
                newSelected.delete(category);
            } else {
                newSelected.add(category);
            }
            return newSelected;
        });
    };

    // Delete selected categories
    const deleteSelectedCategories = () => {
        if (selectedCategories.size === 0) {
            alert("Please select at least one category to delete.");
            return;
        }

        const promises = [...selectedCategories].map(category =>
            axiosInstance.delete(`/api/delete-category/`, {data: {"name": category.name}})
        );

        Promise.all(promises)
            .then(() => {
                // Remove deleted categories from state
                setCategories(categories.filter(cat => !selectedCategories.has(cat)));
                setSelectedCategories(new Set());  // Clear selection
            })
            .catch(error => {
                console.error("Error deleting categories:", error);
            });
    };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Manage Expense Categories</h2>

      {/* List of Categories */}
      <ul className="mb-4" style={{"list-style-type": "none"}}>
        {categories.map((category, index) => (
          <li key={index} className="p-2 border-b">
            <input type="checkbox" onChange={() => handleCheckboxChange(category)} checked={selectedCategories.has(category)}/>
            {category.name}
          </li>
        ))}
      </ul>

      {/* Add New Category */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter new category"
          className="border rounded px-2 py-1 w-full"
        />
        <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>
      <div>
        <button onClick={deleteSelectedCategories} disabled={selectedCategories.size === 0}>
                Delete Selected
        </button>
      </div>
    </div>
  );
};

export default CategoryManager;

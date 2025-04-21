"use client";
import { useState, useEffect, useCallback } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Button";
import { apiAdminGetCategories } from "@/lib/api"; // API to fetch categories

// initialData will be null for adding, or a tool object for editing
export default function ToolForm({ initialData, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "", // Store ID, not name
    component_url: "", // Renamed from componentName based on user feedback
    icon: "",
    isPremium: false,
    isEnabled: true, // Default to enabled for new tools
    // Add other fields if your Tool entity has them
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({}); // For form validation

  // Fetch categories for the dropdown
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const cats = await apiAdminGetCategories(); // Assumes API returns [{ categoryId, name }]
      setCategories(cats || []);
      // Set default category if adding and categories exist
      if (!initialData && cats && cats.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].categoryId }));
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setErrors((prev) => ({
        ...prev,
        category: "Failed to load categories.",
      }));
    } finally {
      setLoadingCategories(false);
    }
  }, [initialData]); // Depend on initialData to potentially reset default

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Populate form if initialData (for editing) is provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        categoryId:
          initialData.categoryId ||
          (categories.length > 0 ? categories[0].categoryId : ""), // Use existing or default
        component_url: initialData.component_url || "", // Use the correct field name
        icon: initialData.icon || "",
        isPremium: initialData.isPremium || false,
        isEnabled:
          initialData.isEnabled === undefined ? true : initialData.isEnabled, // Handle undefined status
      });
    } else {
      // Reset form for adding (ensure default category is set if categories loaded)
      setFormData({
        name: "",
        description: "",
        categoryId: categories.length > 0 ? categories[0].categoryId : "",
        component_url: "",
        icon: "",
        isPremium: false,
        isEnabled: true,
      });
    }
  }, [initialData, categories]); // Re-run if initialData or categories change

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: parseInt(e.target.value, 10) || "",
    }));
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tool name is required.";
    if (!formData.component_url.trim())
      newErrors.component_url = "Component URL is required.";
    else if (!formData.component_url.startsWith("tools/"))
      newErrors.component_url = "URL must start with 'tools/'.";
    if (!formData.categoryId) newErrors.categoryId = "Category is required.";
    // Add more validation rules as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Create payload, ensuring categoryId is a number
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
      };
      onSave(payload); // Pass validated and formatted data to parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      <Input
        label="Tool Name"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      <Input
        label="Description"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        // Not strictly required maybe
      />
      <Input
        label="Component URL (e.g., tools/converters/MyTool.jsx)"
        id="component_url"
        name="component_url"
        value={formData.component_url}
        onChange={handleChange}
        error={errors.component_url}
        required
        placeholder="tools/category/ComponentName.jsx"
      />
      <div>
        <label
          htmlFor="categoryId"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        {loadingCategories ? (
          <Spinner size="sm" />
        ) : (
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            required
            className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 ${errors.categoryId ? "border-red-500" : ""}`}
          >
            <option value="" disabled>
              -- Select Category --
            </option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
        )}
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category}</p>
        )}
      </div>

      <Input
        label="Icon Filename (optional, e.g., icon.png)"
        id="icon"
        name="icon"
        value={formData.icon}
        onChange={handleChange}
        error={errors.icon}
        placeholder="my-tool-icon.png"
      />

      {/* Checkboxes/Toggles for booleans */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center">
          <input
            id="isPremium"
            name="isPremium"
            type="checkbox"
            checked={formData.isPremium}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="isPremium"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Premium Tool?
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="isEnabled"
            name="isEnabled"
            type="checkbox"
            checked={formData.isEnabled}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="isEnabled"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Enabled?
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : initialData ? "Update Tool" : "Add Tool"}
        </Button>
      </div>
    </form>
  );
}

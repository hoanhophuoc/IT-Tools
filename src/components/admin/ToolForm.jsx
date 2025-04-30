"use client";
import { useState, useEffect, useCallback } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { apiAdminGetCategories } from "@/lib/api"; // API to fetch categories

export default function ToolForm({ initialData, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryName: "",
    componentUrl: "",
    icon: "",
    isPremium: false,
    isEnabled: true,
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const cats = await apiAdminGetCategories(); // Assumes API returns [{ categoryId, name }]
      setCategories(cats || []);
      // Set default category NAME if adding and categories exist
      if (!initialData && cats && cats.length > 0) {
        setFormData((prev) => ({ ...prev, categoryName: cats[0].name })); // <-- Set name
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
      const initialCategory = categories.find(
        (c) => c.categoryId === initialData.categoryId,
      );
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        categoryName:
          initialCategory?.name ||
          (categories.length > 0 ? categories[0].name : ""), // <-- Set name
        componentUrl: initialData.componentUrl || "",
        icon: initialData.icon || "",
        isPremium: initialData.isPremium || false,
        isEnabled:
          initialData.isEnabled === undefined ? true : initialData.isEnabled,
      });
    } else {
      // Reset form for adding
      setFormData({
        name: "",
        description: "",
        categoryName: categories.length > 0 ? categories[0].name : "", // <-- Set default name
        componentUrl: "",
        icon: "",
        isPremium: false,
        isEnabled: true,
      });
    }
    // Depend on categories loading as well to set default/initial correctly
  }, [initialData, categories]);

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
    setFormData((prev) => ({ ...prev, categoryName: e.target.value }));
    if (errors.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: null }));
    }
  };

  // *** ENHANCED VALIDATION FUNCTION ***
  const validateForm = () => {
    const newErrors = {};
    // Trim values before checking emptiness
    const name = formData.name.trim();
    const description = formData.description.trim();
    const componentUrl = formData.componentUrl.trim();
    const icon = formData.icon.trim();
    const categoryName = formData.categoryName; // Dropdown ensures selection or empty string

    // Check required fields based on your NOT NULL constraints
    if (!name) {
      newErrors.name = "Tool name is required.";
    } else if (name.length > 50) {
      // Optional: Check max length from DB
      newErrors.name = "Tool name cannot exceed 50 characters.";
    }

    if (!description) {
      newErrors.description = "Tool description is required.";
    }
    // Note: categoryId is handled via categoryName lookup on backend,
    // but we need to ensure a category *name* is selected
    if (!categoryName) {
      // Check if a category name was selected/provided
      newErrors.categoryName = "Category is required.";
    }

    if (!componentUrl) {
      newErrors.componentUrl = "Component URL is required.";
    } else if (!componentUrl.startsWith("tools/")) {
      newErrors.componentUrl = "URL must start with 'tools/'.";
    } else if (componentUrl.length > 100) {
      // Optional: Check max length
      newErrors.componentUrl = "Component URL cannot exceed 100 characters.";
    }

    if (!icon) {
      newErrors.icon = "Icon filename is required.";
    } else if (icon.length > 100) {
      // Optional: Check max length
      newErrors.icon = "Icon filename cannot exceed 100 characters.";
    }

    // isEnabled and isPremium are booleans, usually have default values,
    // no empty check needed unless you have specific rules.

    setErrors(newErrors); // Update the errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors found
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // *** Call validateForm before proceeding ***
    if (validateForm()) {
      onSave(formData); // Call parent save function only if validation passes
    } else {
      console.log("Form validation failed:", errors); // Log errors for debugging
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
        maxLength={50}
      />
      <Input
        label="Description"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        rows={4}
        // Not strictly required maybe
      />
      <Input
        label="Component URL (e.g., tools/converter/MyTool.jsx)"
        id="componentUrl"
        name="componentUrl"
        value={formData.componentUrl}
        onChange={handleChange}
        error={errors.componentUrl}
        required
        placeholder="tools/category/ComponentName.jsx"
        maxLength={100}
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
            id="categoryName"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleCategoryChange}
            required
            className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 ${errors.categoryName ? "border-red-500" : ""}`}
          >
            <option value="" disabled>
              -- Select Category --
            </option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
        {errors.categoryName && (
          <p className="mt-1 text-xs text-red-600">{errors.categoryName}</p>
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
        required
        placeholder="my-tool-icon.svg"
        maxLength={100}
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

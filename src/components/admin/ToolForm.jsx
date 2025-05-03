"use client";
import { useState, useEffect, useCallback } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { apiAdminGetCategories } from "@/lib/api";

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
      const cats = await apiAdminGetCategories();
      setCategories(cats || []);
      if (!initialData && cats && cats.length > 0) {
        setFormData((prev) => ({ ...prev, categoryName: cats[0].name }));
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
  }, [initialData]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
          (categories.length > 0 ? categories[0].name : ""),
        componentUrl: initialData.componentUrl || "",
        icon: initialData.icon || "",
        isPremium: initialData.isPremium || false,
        isEnabled:
          initialData.isEnabled === undefined ? true : initialData.isEnabled,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        categoryName: categories.length > 0 ? categories[0].name : "",
        componentUrl: "",
        icon: "",
        isPremium: false,
        isEnabled: true,
      });
    }
  }, [initialData, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const description = formData.description.trim();
    const componentUrl = formData.componentUrl.trim();
    const icon = formData.icon.trim();
    const categoryName = formData.categoryName;

    if (!name) {
      newErrors.name = "Tool name is required.";
    } else if (name.length > 50) {
      newErrors.name = "Tool name cannot exceed 50 characters.";
    }

    if (!description) {
      newErrors.description = "Tool description is required.";
    }
    if (!categoryName) {
      newErrors.categoryName = "Category is required.";
    }

    if (!componentUrl) {
      newErrors.componentUrl = "Component URL is required.";
    } else if (!componentUrl.startsWith("tools/")) {
      newErrors.componentUrl = "URL must start with 'tools/'.";
    } else if (componentUrl.length > 100) {
      newErrors.componentUrl = "Component URL cannot exceed 100 characters.";
    }

    if (!icon) {
      newErrors.icon = "Icon filename is required.";
    } else if (icon.length > 100) {
      newErrors.icon = "Icon filename cannot exceed 100 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      console.log("Form validation failed:", errors);
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

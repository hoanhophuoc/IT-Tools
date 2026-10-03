"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { apiAdminGetCategories } from "@/lib/api";

function validateToolForm(formData) {
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

  return newErrors;
}

function JsonPrefillBanner({ onPrefill }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON: " + err.message);
      }

      const item = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!item || typeof item !== "object") {
        throw new Error("JSON must contain an object or array of objects.");
      }

      onPrefill(item);
    } catch (err) {
      alert("Error reading JSON file: " + err.message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/40">
      <div>
        <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
          Quick Fill from Tool JSON
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Upload a .json file to auto-populate form fields
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        📁 Load JSON File
      </Button>
    </div>
  );
}

function CategorySelectField({
  categories,
  value,
  onChange,
  loading,
  error,
}) {
  return (
    <div>
      <label
        htmlFor="categoryName"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Category
      </label>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <select
          id="categoryName"
          name="categoryName"
          value={value}
          onChange={onChange}
          required
          className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 ${error ? "border-red-500" : ""}`}
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ToolForm({ initialData, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    categoryName: initialData?.categoryName || "",
    componentUrl: initialData?.componentUrl || "",
    icon: initialData?.icon || "",
    isPremium: Boolean(initialData?.isPremium),
    isEnabled: initialData?.isEnabled ?? true,
  }));
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const cats = await apiAdminGetCategories();
      const list = cats || [];
      setCategories(list);
      setFormData((prev) => {
        if (!prev.categoryName && list.length > 0) {
          const match = initialData?.categoryId
            ? list.find((c) => c.categoryId === initialData.categoryId)
            : null;
          return { ...prev, categoryName: match?.name || list[0].name };
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to load categories:", error);
      setErrors((prev) => ({
        ...prev,
        categoryName: "Failed to load categories.",
      }));
    } finally {
      setLoadingCategories(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleJsonPrefill = (item) => {
    const loadedCategory =
      item.categoryName ||
      item.CategoryName ||
      item.category ||
      item.Category ||
      "";

    setFormData((prev) => ({
      ...prev,
      name: (item.name || item.Name || prev.name || "").trim(),
      description: (
        item.description ||
        item.Description ||
        prev.description ||
        ""
      ).trim(),
      categoryName: loadedCategory || prev.categoryName,
      componentUrl: (
        item.componentUrl ||
        item.ComponentUrl ||
        prev.componentUrl ||
        ""
      ).trim(),
      icon: (item.icon || item.Icon || prev.icon || "").trim(),
      isPremium: Boolean(item.isPremium ?? item.IsPremium ?? prev.isPremium),
      isEnabled: Boolean(item.isEnabled ?? item.IsEnabled ?? prev.isEnabled),
    }));
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateToolForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      {!initialData && <JsonPrefillBanner onPrefill={handleJsonPrefill} />}

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

      <CategorySelectField
        categories={categories}
        value={formData.categoryName}
        onChange={handleChange}
        loading={loadingCategories}
        error={errors.categoryName}
      />

      <Input
        label="Icon Filename (optional, e.g., icon.svg)"
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

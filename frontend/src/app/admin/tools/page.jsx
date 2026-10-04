"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ToolForm from "@/components/admin/ToolForm";
import Spinner from "@/components/ui/Spinner";
import {
  apiAdminGetAllTools,
  apiAdminCreateTool,
  apiAdminUpdateTool,
  apiAdminDeleteTool,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function AdminToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const fetchTools = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminGetAllTools();
      setTools(data || []);
    } catch (err) {
      setError(err.message || "Failed to load tools.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleOpenAddModal = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
    setError(null);
  };

  const handleSaveTool = async (formData) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingTool) {
        await apiAdminUpdateTool(editingTool.toolId, formData);
      } else {
        await apiAdminCreateTool(formData);
      }
      handleCloseModal();
      fetchTools();
    } catch (err) {
      console.error("Failed to save tool:", err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTool = async (tool) => {
    if (
      window.confirm(
        `Are you sure you want to delete the tool "${tool.name}"? This action cannot be undone.`,
      )
    ) {
      setError(null);
      try {
        await apiAdminDeleteTool(tool.toolId);
        fetchTools();
      } catch (err) {
        console.error("Failed to delete tool:", err);
        setError(err.message || "Failed to delete tool.");
        alert(`Error deleting tool: ${err.message}`);
      }
    }
  };

  const normalizeTool = (raw) => ({
    name: (raw.name || raw.Name || "").trim(),
    description: (raw.description || raw.Description || "").trim(),
    categoryName: (
      raw.categoryName ||
      raw.CategoryName ||
      raw.category ||
      raw.Category ||
      ""
    ).trim(),
    componentUrl: (raw.componentUrl || raw.ComponentUrl || "").trim(),
    icon: (raw.icon || raw.Icon || "").trim(),
    isPremium: Boolean(raw.isPremium ?? raw.IsPremium ?? false),
    isEnabled: Boolean(raw.isEnabled ?? raw.IsEnabled ?? true),
  });

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    setError(null);

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error("Invalid JSON file format: " + jsonErr.message);
      }

      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) {
        throw new Error("JSON file does not contain any tool definitions.");
      }

      let successCount = 0;
      const errors = [];
      const createdNames = [];
      const validTools = [];

      for (const raw of items) {
        const tool = normalizeTool(raw);
        if (!tool.name || !tool.componentUrl || !tool.categoryName) {
          errors.push(
            `Tool '${tool.name || "Unnamed"}': missing name, componentUrl, or categoryName.`,
          );
          continue;
        }
        if (!tool.componentUrl.startsWith("tools/")) {
          errors.push(
            `Tool '${tool.name}': componentUrl must start with 'tools/'.`,
          );
          continue;
        }
        validTools.push(tool);
      }

      await Promise.all(
        validTools.map(async (tool) => {
          try {
            await apiAdminCreateTool(tool);
            successCount++;
            createdNames.push(tool.name);
          } catch (apiErr) {
            errors.push(`Tool '${tool.name}': ${apiErr.message}`);
          }
        }),
      );

      if (successCount > 0) {
        await fetchTools();
      }

      if (errors.length === 0) {
        setImportStatus({
          type: "success",
          message: `Successfully imported ${successCount} tool(s): ${createdNames.join(", ")}`,
        });
      } else if (successCount > 0) {
        setImportStatus({
          type: "warning",
          message: `Imported ${successCount} tool(s) (${createdNames.join(", ")}). Issues: ${errors.join("; ")}`,
        });
      } else {
        setImportStatus({
          type: "error",
          message: `Failed to import: ${errors.join("; ")}`,
        });
      }
    } catch (err) {
      setImportStatus({
        type: "error",
        message: err.message || "Failed to import JSON file.",
      });
    } finally {
      setIsImporting(false);
      fileInputRef.current.value = "";
    }
  };

  const columns = [
    { key: "toolId", label: "ID" },
    { key: "name", label: "Name" },
    { key: "categoryName", label: "Category" },
    { key: "componentUrl", label: "Component URL" },
    { key: "isPremium", label: "Premium" },
    { key: "isEnabled", label: "Status" },
    {
      key: "createdAt",
      label: "Registered At",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  if (!isAuthenticated) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Tool Management</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json,application/json"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            isLoading={isImporting}
            disabled={isImporting}
          >
            📥 Import JSON
          </Button>
          <Button onClick={handleOpenAddModal} variant="primary">
            + Add New Tool
          </Button>
        </div>
      </div>

      {importStatus && (
        <div
          className={`mb-4 flex items-center justify-between rounded p-3 text-sm ${
            importStatus.type === "success"
              ? "border border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : importStatus.type === "warning"
                ? "border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                : "border border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          <span>{importStatus.message}</span>
          <button
            onClick={() => setImportStatus(null)}
            className="ml-4 font-bold hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-4">
          <Spinner size="lg" />
        </div>
      )}
      {error && !isModalOpen && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && (
        <Table
          columns={columns}
          data={tools}
          searchPlaceholder="Search tools by name, category, or URL..."
          actions={{
            edit: handleOpenEditModal,
            delete: handleDeleteTool,
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTool ? "Edit Tool" : "Add New Tool"}
        size="lg"
      >
        {error && isModalOpen && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}
        <ToolForm
          key={editingTool ? editingTool.toolId : "add"}
          initialData={editingTool}
          onSave={handleSaveTool}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
}

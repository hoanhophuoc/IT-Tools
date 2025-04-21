"use client";
import { useState, useEffect, useCallback } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ToolForm from "@/components/admin/ToolForm"; // Import the new form
import { Spinner } from "@/components/ui/Button";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null); // null for Add, tool object for Edit
  const [isSaving, setIsSaving] = useState(false); // Loading state for save/update
  const { isAuthenticated } = useAuth();

  const fetchTools = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      // Use AdminToolDto which includes isEnabled
      const data = await apiAdminGetAllTools();
      setTools(data || []); // Ensure it's an array
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
    setError(null); // Clear errors when closing modal
  };

  // Called by ToolForm on successful save
  const handleSaveTool = async (formData) => {
    setIsSaving(true);
    setError(null); // Clear previous errors specifically for save action
    try {
      // Backend expects DTO matching CreateToolDto or UpdateToolDto structure
      // Ensure formData is correctly structured before sending
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId, 10), // Ensure integer
        component_url: formData.component_url,
        icon: formData.icon,
        isPremium: formData.isPremium,
        isEnabled: formData.isEnabled,
      };

      if (editingTool) {
        // Update requires the ID
        await apiAdminUpdateTool(editingTool.toolId, payload);
      } else {
        // Create
        await apiAdminCreateTool(payload);
      }
      handleCloseModal();
      fetchTools(); // Refresh the list
    } catch (err) {
      console.error("Failed to save tool:", err);
      // Display error to the user, potentially inside the modal or globally
      setError(`Save failed: ${err.message}`);
      // Keep modal open by *not* calling handleCloseModal() here
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
      // Optionally set a specific loading state for delete
      setError(null);
      try {
        await apiAdminDeleteTool(tool.toolId);
        fetchTools(); // Refresh list
        // Optionally show a success notification/toast
      } catch (err) {
        console.error("Failed to delete tool:", err);
        setError(err.message || "Failed to delete tool.");
        alert(`Error deleting tool: ${err.message}`); // Simple feedback
      } finally {
        // Clear specific loading state if used
      }
    }
  };

  // Define columns for the tools table
  const columns = [
    { key: "toolId", label: "ID" },
    { key: "name", label: "Name" },
    { key: "categoryName", label: "Category" },
    { key: "component_url", label: "Component URL" }, // Updated field name
    { key: "isPremium", label: "Premium" }, // Rendered by Table component
    { key: "isEnabled", label: "Status" }, // Rendered by Table component
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
      <h2 className="mb-4 text-xl font-semibold">Tool Management</h2>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenAddModal} variant="primary">
          Add New Tool
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <Spinner size="lg" />
        </div>
      )}
      {/* Display global errors for the page */}
      {error && !isModalOpen && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && (
        <Table
          columns={columns}
          data={tools}
          actions={{
            edit: handleOpenEditModal,
            delete: handleDeleteTool,
          }}
        />
      )}
      {/* Add Pagination if needed */}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTool ? "Edit Tool" : "Add New Tool"}
        size="lg"
      >
        {/* Display save errors within the modal */}
        {error && isModalOpen && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}
        <ToolForm
          key={editingTool ? editingTool.toolId : "add"} // Add key to force re-render/reset form state
          initialData={editingTool}
          onSave={handleSaveTool}
          onCancel={handleCloseModal}
          isLoading={isSaving} // Pass saving state to form
        />
      </Modal>
    </div>
  );
}

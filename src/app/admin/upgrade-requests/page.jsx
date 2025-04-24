"use client";
import { useState, useEffect, useCallback } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button"; // Use button for actions if preferred
import Spinner from "@/components/ui/Spinner";
import { apiAdminGetPendingRequests, apiAdminProcessRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUpgradeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Track which request is being processed
  const { isAuthenticated } = useAuth();

  const fetchRequests = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      // Backend returns UpgradeRequestDto: { requestId, userId, username, status, requestedAt, ... }
      const data = await apiAdminGetPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || "Failed to load upgrade requests.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleProcessRequest = async (requestId, newStatus) => {
    if (processingId) return; // Prevent multiple clicks
    setProcessingId(requestId);
    setError(null);

    try {
      await apiAdminProcessRequest(requestId, { newStatus });
      // Refresh the list after processing
      fetchRequests();
    } catch (err) {
      console.error(`Failed to ${newStatus} request:`, err);
      setError(err.message || `Failed to ${newStatus} request.`);
      alert(`Error: ${err.message}`); // Simple feedback
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { key: "requestId", label: "Req ID" },
    { key: "username", label: "Username" },
    { key: "userId", label: "User ID" },
    {
      key: "requestedAt",
      label: "Requested At",
      render: (row) => new Date(row.requestedAt).toLocaleString(),
    },
    // Status column might not be needed if only showing pending
  ];

  if (!isAuthenticated) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Pending Premium Requests</h2>

      {loading && (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      )}
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <Table
          columns={columns}
          data={requests}
          actions={{
            approve: (row) => handleProcessRequest(row.requestId, "Approved"),
            reject: (row) => handleProcessRequest(row.requestId, "Rejected"),
          }}
        />
      )}
    </div>
  );
}

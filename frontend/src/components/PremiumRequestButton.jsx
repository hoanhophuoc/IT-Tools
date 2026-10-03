"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { apiRequestPremium } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import { FiStar } from "react-icons/fi";

export default function PremiumRequestButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  if (user?.role === "Premium" || user?.role === "Admin") {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmRequest = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await apiRequestPremium({ userId: user.userId });
      setSuccess(true);
      setTimeout(() => setIsModalOpen(false), 3000);
    } catch (err) {
      console.error("Premium request failed:", err);
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpenModal} variant="warning" size="sm">
        <FiStar className="mr-1 inline-block" /> Go Premium
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Request Premium Access"
      >
        <div className="space-y-4">
          {success ? (
            <p className="text-center text-green-600">
              Your request has been submitted successfully! An administrator
              will review it shortly.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Would you like to request an upgrade to a Premium account? This
                will grant you access to all exclusive tools.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                An administrator will review your request. Please note that
                approval may take some time. You are already premium role if you
                don't see this upgrade request modal.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmRequest}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" /> : "Confirm Request"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

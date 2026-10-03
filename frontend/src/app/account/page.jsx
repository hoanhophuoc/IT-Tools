"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiChangePassword } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function AccountPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    setIsLoading(true);
    try {
      await apiChangePassword({
        Username: user.username,
        OldPassword: oldPassword,
        NewPassword: newPassword,
      });
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-red-600">
        You must be logged in to view this page.
      </div>
    );
  }

  return (
    <div>
      <div className="w-[clamp(300px,90vw,800px)] rounded-lg bg-white p-6 shadow-lg md:p-8 dark:bg-gray-800">
        <h1 className="mb-6 border-b border-gray-200 pb-3 text-2xl font-semibold dark:border-gray-700">
          Account Settings
        </h1>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium">Your Information</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Username:</strong> {user?.username}
            </p>
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Old Password"
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={error && error.includes("match") ? error : null}
            />

            {error && !error.includes("match") && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Change Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

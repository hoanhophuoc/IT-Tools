// src/app/(auth)/forgot-password/page.jsx
"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiDirectResetPassword } from "@/lib/api"; // Import the new API function
import Link from "next/link";
import { useRouter } from "next/navigation"; // For redirection

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Still good practice to confirm
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!username || !newPassword) {
      setError("Username and new password are required.");
      return;
    }

    setIsLoading(true);
    try {
      // Call the direct reset API
      const response = await apiDirectResetPassword({ username, newPassword });
      setSuccessMessage(
        response.message ||
          "Password reset successfully! Redirecting to login...",
      );
      // Redirect to login after a short delay
      router.push("/auth/login");
    } catch (err) {
      setError(
        err.message ||
          "Password reset failed. Please check the username or try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
      >
        <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Reset Password
        </h2>

        {/* Show form only if no success message */}
        {!successMessage ? (
          <>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your username and new password.
            </p>
            <Input
              label="Username"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
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
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </>
        ) : (
          // Show success message
          <p className="text-center text-green-600 dark:text-green-400">
            {successMessage}
          </p>
        )}
        <p className="pt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}

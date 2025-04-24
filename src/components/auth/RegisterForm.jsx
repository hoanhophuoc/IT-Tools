"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter(); // Get router instance

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(username, password);
      if (success) {
        setSuccess("Registration successful! Redirecting to login...");
        // Redirect to login page after a short delay
        router.push("/auth/login");
      } else {
        // Error handled by register function setting its own error or throwing
        // Might get specific error from API (e.g., username taken)
        setError("Registration failed. Username might already exist.");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred during registration.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
    >
      <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
        Register
      </h2>
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
        label="Password"
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <Input
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        error={error && error.includes("match") ? error : null}
      />
      {error && !error.includes("match") && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading || success}
        className="w-full"
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Login here
        </Link>
      </p>
    </form>
  );
}

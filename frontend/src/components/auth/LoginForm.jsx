"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during login.");
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
        Login
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
        autoComplete="current-password"
      />
      <div className="text-right text-sm">
        <Link
          href="/auth/forgot-password"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Forgot Password?
        </Link>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Register here
        </Link>
      </p>
    </form>
  );
}

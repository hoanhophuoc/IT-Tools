import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AccountPage from "../../src/app/account/page.jsx";
import ForgotPasswordPage from "../../src/app/auth/forgot-password/page.jsx";
import * as api from "../../src/lib/api.js";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

let mockAuth = {
  user: { userId: 5, username: "john_doe", role: "User" },
  isAuthenticated: true,
  loading: false,
};

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("../../src/lib/api", () => ({
  apiChangePassword: vi.fn(),
  apiDirectResetPassword: vi.fn(),
}));

describe("Account & Auth Pages Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      user: { userId: 5, username: "john_doe", role: "User" },
      isAuthenticated: true,
      loading: false,
    };
  });

  describe("AccountPage", () => {
    it("renders spinner when auth is loading", () => {
      mockAuth.loading = true;
      render(<AccountPage />);
      expect(screen.queryByText("Account Settings")).toBeNull();
    });

    it("renders unauthenticated warning when not logged in", () => {
      mockAuth.isAuthenticated = false;
      render(<AccountPage />);
      expect(screen.getByText("You must be logged in to view this page.")).toBeTruthy();
    });

    it("renders user information when logged in", () => {
      render(<AccountPage />);
      expect(screen.getByText("Account Settings")).toBeTruthy();
      expect(screen.getByText("john_doe")).toBeTruthy();
      expect(screen.getByText("User")).toBeTruthy();
    });

    it("shows error when new passwords do not match", async () => {
      render(<AccountPage />);
      fireEvent.change(screen.getByLabelText("Old Password"), { target: { value: "oldPass123!" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "Different123!" } });

      fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

      await waitFor(() => {
        expect(screen.getByText("New passwords do not match.")).toBeTruthy();
      });
      expect(api.apiChangePassword).not.toHaveBeenCalled();
    });

    it("shows error when password fields are empty", async () => {
      render(<AccountPage />);
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });
      const form = screen.getByRole("button", { name: "Change Password" }).closest("form");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Please fill in all password fields.")).toBeTruthy();
      });
      expect(api.apiChangePassword).not.toHaveBeenCalled();
    });

    it("submits password change and displays success message on success", async () => {
      vi.mocked(api.apiChangePassword).mockResolvedValueOnce({ message: "Success" });

      render(<AccountPage />);
      fireEvent.change(screen.getByLabelText("Old Password"), { target: { value: "oldPass123!" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

      fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

      await waitFor(() => {
        expect(api.apiChangePassword).toHaveBeenCalledWith({
          Username: "john_doe",
          OldPassword: "oldPass123!",
          NewPassword: "NewPass123!",
        });
        expect(screen.getByText("Password changed successfully!")).toBeTruthy();
      });
    });

    it("displays error when apiChangePassword fails", async () => {
      vi.mocked(api.apiChangePassword).mockRejectedValueOnce(new Error("Current password incorrect."));

      render(<AccountPage />);
      fireEvent.change(screen.getByLabelText("Old Password"), { target: { value: "wrongPass" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

      fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

      await waitFor(() => {
        expect(screen.getByText("Current password incorrect.")).toBeTruthy();
      });
    });

    it("displays fallback error when apiChangePassword fails with empty message", async () => {
      vi.mocked(api.apiChangePassword).mockRejectedValueOnce(new Error(""));

      render(<AccountPage />);
      fireEvent.change(screen.getByLabelText("Old Password"), { target: { value: "wrongPass" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

      fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to change password.")).toBeTruthy();
      });
    });
  });

  describe("ForgotPasswordPage", () => {
    it("renders password reset form", () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByRole("heading", { name: "Reset Password" })).toBeTruthy();
      expect(screen.getByLabelText("Username")).toBeTruthy();
    });

    it("validates mismatched passwords", async () => {
      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "pass1" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "pass2" } });

      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("New passwords do not match.")).toBeTruthy();
      });
      expect(api.apiDirectResetPassword).not.toHaveBeenCalled();
    });

    it("shows error when username or new password is empty", async () => {
      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "pass1" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "pass1" } });
      const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Username and new password are required.")).toBeTruthy();
      });
      expect(api.apiDirectResetPassword).not.toHaveBeenCalled();
    });

    it("successfully submits password reset and redirects to login", async () => {
      vi.mocked(api.apiDirectResetPassword).mockResolvedValueOnce({
        message: "Password reset successfully!",
      });

      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "newSecret123" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "newSecret123" } });

      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(api.apiDirectResetPassword).toHaveBeenCalledWith({
          username: "alice",
          newPassword: "newSecret123",
        });
        expect(mockPush).toHaveBeenCalledWith("/auth/login");
      });
    });

    it("handles error response when reset fails", async () => {
      vi.mocked(api.apiDirectResetPassword).mockRejectedValueOnce(new Error("User not found"));

      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("Username"), { target: { value: "nonexistent" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "newSecret123" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "newSecret123" } });

      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("User not found")).toBeTruthy();
      });
    });

    it("handles success message fallback when response has no message", async () => {
      vi.mocked(api.apiDirectResetPassword).mockResolvedValueOnce({});

      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("Username"), { target: { value: "alice" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "newSecret123" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "newSecret123" } });

      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("Password reset successfully! Redirecting to login...")).toBeTruthy();
      });
    });

    it("handles fallback error when reset fails with empty message", async () => {
      vi.mocked(api.apiDirectResetPassword).mockRejectedValueOnce(new Error(""));

      render(<ForgotPasswordPage />);
      fireEvent.change(screen.getByLabelText("Username"), { target: { value: "nonexistent" } });
      fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "newSecret123" } });
      fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "newSecret123" } });

      fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

      await waitFor(() => {
        expect(screen.getByText("Password reset failed. Please check the username or try again.")).toBeTruthy();
      });
    });
  });
});

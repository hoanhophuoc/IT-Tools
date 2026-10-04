import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ToolCard from "../../src/components/ToolCard.jsx";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

let mockAuth = {
  isAuthenticated: false,
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  favoriteToolIds: new Set(),
};

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

describe("ToolCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      isAuthenticated: false,
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      favoriteToolIds: new Set(),
    };
  });

  it("renders tool details properly with premium star and handles image load error", () => {
    const mockTool = {
      toolId: 101,
      slug: "base64-converter",
      name: "Base64 Converter",
      description: "Convert string to Base64 representation",
      icon: "base64.svg",
      isPremium: true,
    };

    const { container } = render(<ToolCard tool={mockTool} />);

    expect(screen.getByText("Base64 Converter")).toBeTruthy();
    expect(screen.getByText("Convert string to Base64 representation")).toBeTruthy();
    expect(screen.getByTitle("Premium Tool")).toBeTruthy();

    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    fireEvent.error(img);
  });

  it("renders fallback icon when icon is null or empty", () => {
    const mockTool = {
      toolId: 102,
      slug: "no-icon-tool",
      name: "No Icon Tool",
      description: "Tool with default fallback icon",
      icon: null,
      isPremium: false,
    };

    render(<ToolCard tool={mockTool} />);

    expect(screen.getByText("No Icon Tool")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders favorite button when user is authenticated", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.favoriteToolIds = new Set([103]);

    const mockTool = {
      toolId: 103,
      slug: "fav-tool",
      name: "Favorite Tool",
      description: "Favorited tool",
      icon: "fav.svg",
      isPremium: false,
    };

    render(<ToolCard tool={mockTool} />);

    expect(screen.getByTitle("Remove from favorites")).toBeTruthy();
  });

  it("handles missing or invalid tool data gracefully", () => {
    const { rerender } = render(<ToolCard tool={null} />);
    expect(screen.getByText("Invalid Tool Data")).toBeTruthy();

    rerender(<ToolCard tool={{ name: "No Slug" }} />);
    expect(screen.getByText("Invalid Tool Data")).toBeTruthy();

    rerender(<ToolCard tool={{ slug: "no-name" }} />);
    expect(screen.getByText("Invalid Tool Data")).toBeTruthy();
  });
});

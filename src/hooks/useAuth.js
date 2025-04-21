// src/hooks/useAuth.js
import { useContext } from "react";
// Adjust the path based on your actual AuthContext file location
import { AuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    // Provide a more helpful error message
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure your component is wrapped by AuthProvider.",
    );
  }
  return context;
};

// IMPORTANT: Ensure you have removed or commented out the export const useAuth = () => useContext(AuthContext);
// line from WITHIN your src/contexts/AuthContext.jsx file to avoid conflicts.
// Keep the createContext line there.

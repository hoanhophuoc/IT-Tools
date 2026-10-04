import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext.js";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure your component is wrapped by AuthProvider.",
    );
  }
  return context;
};

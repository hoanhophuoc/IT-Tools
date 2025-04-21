// src/lib/api.js
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7119/api"; // Use your actual backend URL

async function fetchWithAuth(url, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null; // Check if window exists for localStorage
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else if (response.ok && response.status === 204) {
      responseData = null; // No content, successful
    } else {
      responseData = await response.text(); // Fallback for non-JSON or errors before JSON parsing
    }

    if (!response.ok) {
      const message =
        responseData?.message ||
        responseData ||
        `Request failed with status ${response.status}`;
      console.error(`API Error (${response.status}): ${url}`, responseData);
      // Try to extract specific error messages if backend provides them
      const specificError = responseData?.errors
        ? JSON.stringify(responseData.errors)
        : message;
      throw new Error(specificError);
    }

    return responseData;
  } catch (error) {
    console.error(`Network or Fetch Error: ${url}`, error);
    // Re-throw the error so calling components can handle it
    throw error; // Ensure errors propagate
  }
}

// --- Auth ---
export const apiLogin = (credentials) =>
  fetchWithAuth("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const apiRegister = (credentials) =>
  fetchWithAuth("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
// Backend needs an endpoint to get current user profile based on token
export const apiFetchUserProfile = () => fetchWithAuth("/auth/profile"); // GET request assumed
// Backend needs endpoint for password change
export const apiChangePassword = (passwords) =>
  fetchWithAuth("/account/change-password", {
    method: "POST",
    body: JSON.stringify(passwords),
  }); // Requires Auth

// --- Tools ---
export const apiGetEnabledTools = () => fetchWithAuth("/tools"); // Assumes returns array including: { toolId, name, description, component_url, icon, isPremium, categoryId }
export const apiGetToolDetails = (
  toolName, // <-- Changed parameter name for clarity
) => fetchWithAuth(`/tools/${encodeURIComponent(toolName)}`); // <-- Use tool name in the API path, properly encoded

// --- Categories ---
// Assumes endpoint returns Array<{ categoryId, name, tools: Array<{ toolId, name, component_url, isPremium }>}>
// **IMPORTANT**: Ensure this endpoint returns 'name' and 'component_url' for each tool within the category.
export const apiGetCategories = () => fetchWithAuth("/categories");
// Admin endpoint to get categories for dropdowns etc.
export const apiAdminGetCategories = () => fetchWithAuth("/admin/categories"); // Assumes returns array including: { categoryId, name }

// --- Premium ---
export const apiRequestPremium = () =>
  fetchWithAuth("/premium/request", { method: "POST" }); // Requires Auth

// --- Admin: Tools ---
export const apiAdminGetAllTools = () => fetchWithAuth("/admin/tools");
export const apiAdminCreateTool = (toolData) =>
  fetchWithAuth("/admin/tools", {
    method: "POST",
    body: JSON.stringify(toolData),
  });
// Assuming PUT replaces the entire resource or specific fields based on DTO
export const apiAdminUpdateTool = (id, toolData) =>
  fetchWithAuth(`/admin/tools/${id}`, {
    method: "PUT",
    body: JSON.stringify(toolData),
  });
export const apiAdminUpdateToolStatus = (id, statusData) =>
  fetchWithAuth(`/admin/tools/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(statusData),
  });
export const apiAdminDeleteTool = (id) =>
  fetchWithAuth(`/admin/tools/${id}`, { method: "DELETE" });

// --- Admin: Users ---
export const apiAdminGetAllUsers = () => fetchWithAuth("/admin/users");
// Add other user management endpoints if needed
// export const apiAdminUpdateUserRole = (userId, roleData) => fetchWithAuth(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify(roleData) });
// export const apiAdminDeleteUser = (userId) => fetchWithAuth(`/admin/users/${userId}`, { method: 'DELETE' });

// --- Admin: Upgrade Requests ---
export const apiAdminGetPendingRequests = () =>
  fetchWithAuth("/admin/upgrade-requests");
export const apiAdminProcessRequest = (requestId, statusData) =>
  fetchWithAuth(`/admin/upgrade-requests/${requestId}/status`, {
    method: "PUT",
    body: JSON.stringify(statusData),
  });

// --- Favorites ---
// Add API calls for favorites if needed (e.g., get favorites, add/remove favorite)

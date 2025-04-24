// src/app/layout.jsx
"use client"; // Required because it manages state (isSidebarOpen) and uses useEffect

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
// Client-side fetch for categories - ensure apiGetCategorizedTools works client-side
import { apiGetCategorizedTools } from "@/lib/api";
// Correct the Spinner import path

const inter = Inter({ subsets: ["latin"] });

// Cannot export metadata directly from client component root layout
// Manage title dynamically if needed using useEffect and document.title

export default function RootAndMainLayout({ children }) {
  // --- State Management ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start open on larger screens potentially
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null); // Added error state
  const [isClient, setIsClient] = useState(false); // State to track if client has mounted

  // Set isClient to true only after mounting on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Fetch Categories Client-Side ---
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCategories(true);
      setErrorCategories(null); // Clear previous errors
      try {
        // Ensure fetchWithAuth in api.js handles potential missing token gracefully client-side
        const data = await apiGetCategorizedTools();
        if (!Array.isArray(data)) {
          console.warn(
            "API did not return an array for categories. Check backend response for GET /api/tools",
          );
          setCategories([]);
        } else {
          setCategories(data);
        }
      } catch (err) {
        console.error("Client-side fetch categories error:", err);
        setErrorCategories(`Could not load navigation: ${err.message}`); // Set error message
        setCategories([]); // Ensure empty array on error
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []); // Fetch once on mount

  // --- Responsive Sidebar Toggle ---
  useEffect(() => {
    // Only run this logic on the client *after* initial mount/hydration
    if (!isClient) {
      return; // Don't run on server or initial hydration mismatch phase
    }
    const handleResize = () => {
      // Default to open on desktop, closed on mobile
      const shouldBeOpen = window.innerWidth >= 768; // md breakpoint
      setIsSidebarOpen(shouldBeOpen);
    };
    // Set initial state based on window size
    handleResize();
    // Add resize listener
    window.addEventListener("resize", handleResize);
    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]); // Run only once on initial mount

  // --- Toggle Function ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- Dynamic Title (Example) ---
  useEffect(() => {
    document.title = "IT-Tools"; // Set default or update based on route later if needed
  }, []);

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-200`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Pass state and toggle function to Sidebar */}
            <Sidebar
              categories={categories}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar} // Pass the function
              isLoading={loadingCategories} // Pass loading state
              error={errorCategories} // Pass error state
            />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-800">
              {" "}
              {/* Added background to content area */}
              {/* Pass state and toggle function to Header */}
              <Header
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                // Pass categories if Header needs them when Sidebar is collapsed
                // categories={categories} // Header doesn't strictly need full list now
                // isLoadingCategories={loadingCategories}
              />
              {/* Apply padding and max-width to the main content */}
              <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
                {" "}
                {/* Allow scrolling */}
                <div className="mx-auto max-w-7xl">
                  {/* Render nested page content */}
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import { apiGetCategorizedTools } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RootAndMainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
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
        setErrorCategories(`Could not load navigation: ${err.message}`);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }
    const handleResize = () => {
      const shouldBeOpen = window.innerWidth >= 768;
      setIsSidebarOpen(shouldBeOpen);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    document.title = "IT-Tools";
  }, []);

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-200`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar
              categories={categories}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              isLoading={loadingCategories}
              error={errorCategories}
            />
            <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-800">
              <Header
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
              />
              <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

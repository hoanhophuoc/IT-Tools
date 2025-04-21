// No "use client" here if it only renders AuthProvider and basic HTML
import "./globals.css";
import { Inter } from "next/font/google"; // Example font
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IT-Tools",
  description: "Handy tools for developers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

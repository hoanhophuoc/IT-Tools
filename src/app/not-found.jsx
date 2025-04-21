import Link from "next/link";
import { FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl dark:bg-gray-800">
        <FiAlertTriangle size={50} className="mx-auto mb-4 text-red-500" />
        <h1 className="mb-2 text-4xl font-bold text-red-500">404</h1>
        <h2 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Oops! The page you are looking for does not exist or may have been
          moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

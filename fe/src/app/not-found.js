import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

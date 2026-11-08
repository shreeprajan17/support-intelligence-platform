import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-indigo-600 dark:text-indigo-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 dark:bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Unauthorized</h1>
        <p className="mt-3 text-sm text-gray-600">
          You need to enter the admin passkey before accessing this area.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

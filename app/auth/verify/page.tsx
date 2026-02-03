// app/auth/verify/page.tsx
import { verifyEmailAction } from "@/lib/actions/veri-actions";
// import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold text-red-600">Missing Token</h1>
        <p>This verification link is invalid or broken.</p>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  // 1. Handle Error State
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-red-50 p-8 rounded-lg border border-red-200 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Verification Failed
          </h1>
          {/* Use result.error here now that we've checked !result.success */}
          <p className="text-red-600 mb-4">{result.error}</p>
          <Link href="/auth/resend" className="text-blue-600 hover:underline">
            Request a new verification link
          </Link>
        </div>
      </div>
    );
  }

  // 2. Handle Success State
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-green-50 p-8 rounded-lg border border-green-200 shadow-sm">
        <h1 className="text-2xl font-bold text-green-700 mb-2">
          Email Verified!
        </h1>
        <p className="text-green-600 mb-6">
          Thank you. Your account is now active.
        </p>
        <Link
          href="/login"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

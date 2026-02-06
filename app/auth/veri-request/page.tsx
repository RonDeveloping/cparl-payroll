//"Check your inbox" informative page
// app/auth/verify/page.tsx
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function VerifyRequestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <MailCheck className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Check your email
        </h1>
        <p className="text-slate-600 mb-6">
          We&apos;ve sent a verification link to your email address. Please
          click the link to activate your account.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive an email? Check your spam folder or
          </p>
          <Link
            href={ROUTES.AUTH.RESEND}
            className="text-blue-600 font-medium hover:underline"
          >
            click here to resend
          </Link>
        </div>

        <hr className="my-8 border-slate-100" />

        <Link
          href="/login"
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}

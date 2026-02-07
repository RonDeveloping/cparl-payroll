import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Safety check: if somehow they got past middleware without a valid DB user
  if (!user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user.email}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Account Status:{" "}
          <span className="text-green-600 font-medium">Verified</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Email
          </p>
          <p className="text-slate-700 font-medium">{user.email}</p>
        </div>
        {/* Add more stats or profile info here */}
      </div>
    </div>
  );
}

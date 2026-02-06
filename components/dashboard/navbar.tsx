// components/dashboard/navbar.tsx
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth-actions";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="h-16 border-b bg-white px-8 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold text-blue-600">
        <LayoutDashboard size={20} />
        <span>MyApp</span>
      </div>

      <div className="flex items-center gap-6">
        {session ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={16} className="text-slate-400" />
              <span>{session.email}</span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        ) : (
          <a href="/auth/login" className="text-sm font-medium text-blue-600">
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
}

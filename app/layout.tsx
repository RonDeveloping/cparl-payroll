/* An app/layout.tsx is required by Next.js(App Router) acting as default wrapper for every page.tsx in root folder and its subfolders. A layout.tsx in a subfolder where a page.tsx exists will sit inside its parent layout(recursive nesting); This app/layout.tsx includes a navibar hidable on scroll down and show up on scroll up*/

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/lib/auth-utils";
import LogoutSync from "@/components/logout-sync";

// This Metadata applies to every page by default; individual pages can override this.
export const metadata: Metadata = {
  title: {
    default: "CPARL Payroll",
    template: "%s | Payroll | CPARL",
    // Page titles become "Page Title | CPARL" such as Users | CPARL
  },
};

//{children} is the content of the specific page being rendered inside this layout; this's a server component so it can't use hooks like useState or useEffect to listen to scroll events
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const navUser = user
    ? {
        email: user.email,
        givenName: user.givenName,
        familyName: user.familyName,
        displayName: user.displayName,
        nickName: user.nickName,
      }
    : null;

  return (
    <html lang="en">
      <body className="bg-white text-black">
        {/*by placing Navbar here, it will appear on every page without rendered*/}
        <Navbar user={navUser} />
        <LogoutSync />
        <Toaster richColors position="top-right" />
        {/* Padding-top ensures content isn't hidden under the fixed navbar */}
        <main className="pt-16 min-h-[150vh]" style={{ paddingTop: "70px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

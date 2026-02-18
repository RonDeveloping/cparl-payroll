// components/dashboard/layout.tsx

import { Suspense } from "react";
import PhoneBannerServer from "@/components/dashboard/phone_banner_server";
import BannerSkeleton from "@/components/dashboard/banner_skeleton";
import Navbar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function DashboardLayout({
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
    <div className="min-h-screen flex flex-col">
      {/* Suspense allows the rest of the layout to render without waiting for the DB query.*/}
      <Suspense fallback={<BannerSkeleton />}>
        <PhoneBannerServer />
      </Suspense>
      <div className="flex-1 flex flex-col">
        <Navbar user={navUser} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

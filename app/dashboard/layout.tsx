// components/dashboard/layout.tsx

import { Suspense } from "react";
import PhoneBannerServer from "@/components/dashboard/phone_banner_server";
import BannerSkeleton from "@/components/dashboard/banner_skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Suspense allows the rest of the layout to render without waiting for the DB query.*/}
      <Suspense fallback={<BannerSkeleton />}>
        <PhoneBannerServer />
      </Suspense>
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

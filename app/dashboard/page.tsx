import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { dashboardStyles } from "@/constants/styles";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Safety check: if somehow they got past middleware without a valid DB user
  if (!user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className={dashboardStyles.pageContainer}>
      <div className={dashboardStyles.heroCard}>
        <h1 className={dashboardStyles.heroTitle}>
          Welcome back, {user.email}! 👋
        </h1>
        <p className={dashboardStyles.heroSubtitle}>
          Account Status:{" "}
          <span className={dashboardStyles.heroStatus}>Verified</span>
        </p>
      </div>

      <div className={dashboardStyles.statsGrid}>
        <div className={dashboardStyles.statCard}>
          <p className={dashboardStyles.statLabel}>Email</p>
          <p className={dashboardStyles.statValue}>{user.email}</p>
        </div>
        {/* Add more stats or profile info here */}
      </div>
    </div>
  );
}

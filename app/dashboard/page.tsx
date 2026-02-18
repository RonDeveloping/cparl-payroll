import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { dashboardStyles } from "@/constants/styles";
import DashboardTiles, {
  type DashboardTile,
} from "@/components/dashboard/dashboard-tiles";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Safety check: if somehow they got past middleware without a valid DB user
  if (!user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const givenName = user.givenName?.trim() || "";
  const familyName = user.familyName?.trim() || "";
  const fallbackName = user.displayName?.trim() || user.nickName?.trim() || "";
  const profileName = givenName || fallbackName || user.email;
  const fullName = [givenName || fallbackName, familyName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const tiles: DashboardTile[] = [
    {
      id: "profile",
      title: "Profile",
      subtitle: "",
      tone: "emerald",
      items: [
        { label: "Full name", value: fullName || profileName },
        { label: "Email", value: user.email },
        { label: "Payroll role", value: "Payroll administrator" },
        { label: "Notifications", value: "Email and SMS" },
      ],
      icon: "profile",
    },
    {
      id: "security",
      title: "Security",
      subtitle: "",
      tone: "blue",
      items: [
        { label: "Multi-factor", value: "Enabled" },
        { label: "Password health", value: "Strong" },
        { label: "Last login", value: "2 hours ago" },
        { label: "Recovery email", value: user.email },
      ],
      icon: "security",
    },
    {
      id: "products",
      title: "Products",
      subtitle: "",
      tone: "violet",
      items: [
        { label: "Payroll", value: "Enabled" },
        { label: "Benefits", value: "Enabled" },
        { label: "Time Tracking", value: "Enabled" },
        { label: "Compliance", value: "Enabled" },
      ],
      icon: "products",
    },
    {
      id: "payments",
      title: "Payments",
      subtitle: "",
      tone: "amber",
      items: [
        { label: "Next run", value: "Mar 1" },
        { label: "Funding status", value: "Ready" },
        { label: "Payout method", value: "Direct deposit" },
        { label: "Last run", value: "Feb 15" },
      ],
      icon: "payments",
    },
    {
      id: "communications",
      title: "Communications",
      subtitle: "",
      tone: "slate",
      items: [
        { label: "Email digest", value: "Weekly" },
        { label: "Payroll alerts", value: "Enabled" },
        { label: "SMS reminders", value: "On" },
        { label: "Support channel", value: "support@cparl.com" },
      ],
      icon: "communications",
    },
  ];

  return (
    <div className={dashboardStyles.pageContainer}>
      <DashboardTiles tiles={tiles} />
    </div>
  );
}

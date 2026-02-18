//layout.tsx for tenants section used for UI(e.g. navbars, footers, or sidebars) that wraps all tenant-related pages such as TenantPage and TenantSettingsPage. layout. Layouts are recursive and can be nested inside the layout of its parent folders.
import { TenantProvider } from "./context/TenantContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantProvider>{children}</TenantProvider>;
}

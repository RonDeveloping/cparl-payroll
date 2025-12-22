//layout.tsx
import { TenantProvider } from "./context/TenantContext"; // Adjust path

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap children with the Provider */}
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}

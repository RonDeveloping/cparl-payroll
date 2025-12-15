import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Users",
    template: "%s | Users",
  },
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

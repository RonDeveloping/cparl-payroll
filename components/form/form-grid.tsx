import { FORM_GRID_STYLE } from "@/constants/styles";

export function FormGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${FORM_GRID_STYLE} ${className}`}>{children}</div>;
}

import { LABEL_STYLE } from "@/constants/styles";

export function CapLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label tabIndex={-1} className={`${LABEL_STYLE} ${className}`}>
      {children}
    </label>
  );
}
//// make label non-focusable to skip in tab order by adding tabIndex={-1}

// components/shared/AuthButton.tsx
import { Loader2 } from "lucide-react";
import { authStyles as s } from "@/constants/styles";

interface AuthButtonProps {
  label: string;
  loadingLabel?: string;
  isPending: boolean;
  countdown?: number;
  onClick: () => void;
}

export const AuthButton = ({
  label,
  loadingLabel = "Sending...",
  isPending,
  countdown = 0,
  onClick,
}: AuthButtonProps) => {
  const isDisabled = isPending || countdown > 0;

  return (
    <button onClick={onClick} disabled={isDisabled} className={s.buttonResend}>
      {isPending && <Loader2 className={s.iconSpinner} />}
      <span>
        {isPending
          ? loadingLabel
          : countdown > 0
            ? `Resend in ${countdown}s`
            : label}
      </span>
    </button>
  );
};

// components/shared/Alert.tsx
import { AlertCircle, Info } from "lucide-react";
import { authStyles as s } from "@//constants/styles";

interface AlertProps {
  message: string;
  variant?: "warning" | "info";
  title?: string;
}

export const Alert = ({ message, variant = "info", title }: AlertProps) => {
  const isWarning = variant === "warning";

  return (
    <div className={isWarning ? s.alertBox : s.reminderBox}>
      {isWarning ? (
        <AlertCircle className={s.iconAlert} />
      ) : (
        <Info className={s.iconInfo} />
      )}
      <div className="flex flex-col">
        {title && <span className="font-bold text-xs mb-1">{title}</span>}
        <p className={isWarning ? s.alertText : s.reminderText}>{message}</p>
      </div>
    </div>
  );
};

"use client";
// app/auth/setup-password/page.tsx

import SetupPasswordForm from "@/components/auth/setup-password-form";
import { authStyles } from "@/constants/styles";

export default function SetupPasswordPage() {
  return (
    <div className={authStyles.registerCard}>
      <SetupPasswordForm />
    </div>
  );
}
// ...existing code...

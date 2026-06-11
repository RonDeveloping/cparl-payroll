// app/auth/register/page.tsx

import RegisterEmailForm from "@/components/auth/register-email-form";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";
import { registerPageContent } from "@/constants/content";

export default function RegisterPage() {
  return (
    <div className={authStyles.registerCard}>
      <h1 className={authStyles.registerTitle}>{registerPageContent.title}</h1>
      <p className={authStyles.registerDescription}>
        {registerPageContent.description}
      </p>

      <RegisterEmailForm />

      <p className={authStyles.registerFooter}>
        Already have an account?{" "}
        <a href={ROUTES.AUTH.LOGIN} className={authStyles.registerLoginLink}>
          Login here
        </a>
      </p>
    </div>
  );
}

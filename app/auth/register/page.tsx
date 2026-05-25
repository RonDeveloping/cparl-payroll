import RegisterEmailForm from "@/components/auth/register-email-form";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

export default function RegisterPage() {
  return (
    <div className={authStyles.registerCard}>
      <h1 className={authStyles.registerTitle}>Start Registration</h1>
      <p className={authStyles.registerDescription}>
        Enter your email to begin. We’ll send you a verification link. You’ll
        complete your profile after verifying your email.
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

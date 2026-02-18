import RegisterForm from "@/components/auth/create-account-form";
import { ROUTES } from "@/constants/routes";
import { authStyles } from "@/constants/styles";

export default function RegisterPage() {
  return (
    <div className={authStyles.registerCard}>
      <h1 className={authStyles.registerTitle}>Create Your Account</h1>
      <p className={authStyles.registerDescription}>
        To access features and services, please register below.
      </p>

      <RegisterForm />

      <p className={authStyles.registerFooter}>
        Already have an account?{" "}
        <a href={ROUTES.AUTH.LOGIN} className={authStyles.registerLoginLink}>
          Login here
        </a>
      </p>
    </div>
  );
}

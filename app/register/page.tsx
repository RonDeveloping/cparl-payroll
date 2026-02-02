import RegisterForm from "@/components/auth/user-register-form";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow-lg border rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Create Your Account</h1>
      <p className="text-gray-600 mb-8">
        To access features and services, please register below.
      </p>

      <RegisterForm />

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600">
          Login here
        </a>
      </p>
    </div>
  );
}

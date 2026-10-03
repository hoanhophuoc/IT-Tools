import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login - IT-Tools",
  description: "Sign in to your IT-Tools account to access your tools and favorites.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <LoginForm />
    </div>
  );
}

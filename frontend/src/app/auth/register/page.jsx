import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register - IT-Tools",
  description: "Create an IT-Tools account to save favorite tools and customize your workspace.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <RegisterForm />
    </div>
  );
}

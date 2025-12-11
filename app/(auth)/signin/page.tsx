import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign In | AI Learning Platform",
  description: "Sign in to start learning programming with AI",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect(params.callbackUrl || "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignInForm callbackUrl={params.callbackUrl} error={params.error} />
    </div>
  );
}


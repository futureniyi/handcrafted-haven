import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to Handcrafted Haven to manage your artisan account, storefront, and handmade product listings.",
};

export default async function LoginPage() {
  const session = await getServerSessionFromCookies();

  if (session?.user.role === "seller") {
    redirect("/dashboard");
  }

  if (session?.user.role === "user") {
    redirect("/catalog");
  }

  return (
    <main id="main-content">
      <LoginForm />
    </main>
  );
}
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a Handcrafted Haven account to start buying handmade products or set up your artisan seller profile.",
};

export default async function RegisterPage() {
  const session = await getServerSessionFromCookies();

  if (session?.user.role === "seller") {
    redirect("/dashboard");
  }

  if (session?.user.role === "user") {
    redirect("/catalog");
  }

  return <RegisterForm />;
}

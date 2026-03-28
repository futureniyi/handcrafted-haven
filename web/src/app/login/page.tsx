import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to Handcrafted Haven to manage your artisan account, storefront, and handmade product listings.",
};

export default function LoginPage() {
  return <LoginForm />;
}

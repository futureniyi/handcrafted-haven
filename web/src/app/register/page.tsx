import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a Handcrafted Haven account to start buying handmade products or set up your artisan seller profile.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

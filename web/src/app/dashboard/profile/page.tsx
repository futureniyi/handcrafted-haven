import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import ProfileFormClient from "../ProfileFormClient";

export const metadata: Metadata = {
  title: "Edit Profile",
  description:
    "Update your public seller bio and story from the Handcrafted Haven dashboard.",
};

export default async function DashboardProfilePage() {
  const session = await getServerSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "seller") {
    redirect("/catalog");
  }

  return <ProfileFormClient seller={session.user} />;
}

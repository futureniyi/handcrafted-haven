import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description:
    "Manage your Handcrafted Haven storefront, update artisan details, and organize handmade product listings from the seller dashboard.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}

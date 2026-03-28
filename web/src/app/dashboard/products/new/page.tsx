import type { Metadata } from "next";
import ProductFormClient from "../../ProductFormClient";

export const metadata: Metadata = {
  title: "Add Product",
  description:
    "Create a new seller product listing from the Handcrafted Haven dashboard.",
};

export default function NewDashboardProductPage() {
  return <ProductFormClient mode="create" />;
}

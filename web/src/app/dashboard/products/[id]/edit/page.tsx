import type { Metadata } from "next";
import ProductFormClient from "../../../../dashboard/ProductFormClient";

type EditDashboardProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Product",
  description:
    "Update an existing seller product listing from the Handcrafted Haven dashboard.",
};

export default async function EditDashboardProductPage({
  params,
}: EditDashboardProductPageProps) {
  const { id } = await params;

  return <ProductFormClient mode="edit" productId={id} />;
}

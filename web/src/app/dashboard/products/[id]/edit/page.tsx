import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
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
  const session = await getServerSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "seller") {
    redirect("/catalog");
  }

  const { id } = await params;
  await dbConnect();

  const product = await Product.findById(id).select("sellerId");

  if (!product) {
    redirect("/dashboard");
  }

  if (product.sellerId.toString() !== session.user.id) {
    redirect("/dashboard");
  }

  return <ProductFormClient mode="edit" productId={id} />;
}

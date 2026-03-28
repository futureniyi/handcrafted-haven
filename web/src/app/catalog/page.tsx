import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Browse the Handcrafted Haven catalog for handmade decor, gifts, accessories, and other artisan-made products.",
};

export default function CatalogPage() {
  return <CatalogClient />;
}

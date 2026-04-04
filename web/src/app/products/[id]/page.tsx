import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getProductImageSrc } from "@/src/lib/product-image";
import { isSellerOwner } from "@/src/lib/ownership";
import ReviewsSection from "./ReviewsSection";
import styles from "./page.module.css";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProductPageData = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  images: string[];
  seller: {
    id: string;
    name: string;
  } | null;
  sellerId: string;
};

function formatCategory(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getProduct(id: string): Promise<ProductPageData | null> {
  await dbConnect();

  const product = await Product.findById(id).populate("sellerId", "name");

  if (!product) {
    return null;
  }

  return {
    id: product._id.toString(),
    name: product.name || "Unnamed product",
    description: product.description || "No description available.",
    price: typeof product.price === "number" ? product.price : null,
    category: product.category || "other",
    images: Array.isArray(product.images) ? product.images : [],
    sellerId: product.sellerId?._id
      ? product.sellerId._id.toString()
      : product.sellerId?.toString?.() || "",
    seller: product.sellerId
      ? {
          id: product.sellerId._id.toString(),
          name: product.sellerId.name || "Seller",
        }
      : null,
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This handmade product could not be found on Handcrafted Haven.",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  const session = await getServerSessionFromCookies();

  if (!product) {
    notFound();
  }

  const canEditProduct = isSellerOwner(session, product.sellerId);

  return (
    <main className={styles.main}>
      <Link className={styles.backLink} href="/catalog">
        ← Back to Catalog
      </Link>

      <section className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.imageFrame}>
            <Image
              src={getProductImageSrc(product.images[0])}
              alt={product.name}
              className={styles.image}
              fill
              sizes="(max-width: 980px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className={styles.panel}>
          {canEditProduct ? (
            <div className={styles.ownerActionRow}>
              <Link
                className={styles.ownerActionButton}
                href={`/dashboard/products/${product.id}/edit`}
              >
                Edit Product
              </Link>
            </div>
          ) : null}

          <p className={styles.category}>{formatCategory(product.category)}</p>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>
            {product.price !== null ? `$${product.price.toFixed(2)}` : "Price unavailable"}
          </p>

          <section>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.description}>{product.description}</p>
          </section>

          <section className={styles.sellerBlock}>
            <h2 className={styles.sectionTitle}>Seller</h2>
            {product.seller ? (
              <>
                <p className={styles.sellerName}>{product.seller.name}</p>
                <Link
                  className={styles.sellerLink}
                  href={`/sellers/${product.seller.id}`}
                >
                  View seller profile
                </Link>
              </>
            ) : (
              <p className={styles.description}>Seller information is unavailable.</p>
            )}
          </section>
        </div>
      </section>

      <ReviewsSection productId={product.id} sellerId={product.sellerId} />
    </main>
  );
}

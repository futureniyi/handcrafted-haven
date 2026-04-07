import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSessionFromCookies } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { getProductImageSrc } from "@/src/lib/product-image";
import Product from "@/models/Product";
import User from "@/models/User";
import { isSellerOwner } from "@/src/lib/ownership";
import styles from "./page.module.css";

type SellerProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SellerProduct = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string;
  imageUrl: string | null;
};

type SellerProfileData = {
  id: string;
  name: string;
  bio: string;
  story: string;
  products: SellerProduct[];
};

function formatCategory(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getSellerProfile(id: string): Promise<SellerProfileData | null> {
  await dbConnect();

  const seller = await User.findById(id).select("name bio story role");

  if (!seller || seller.role !== "seller") {
    return null;
  }

  const products = await Product.find({ sellerId: id })
    .select("name description price images category")
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    id: seller._id.toString(),
    name: seller.name || "Seller",
    bio: seller.bio || "This artisan has not added a short bio yet.",
    story: seller.story || "The seller story will be added here soon.",
    products: products.map((product) => ({
      id: product._id.toString(),
      name: product.name || "Unnamed product",
      description: product.description || "No description available.",
      price: typeof product.price === "number" ? product.price : null,
      category: product.category || "other",
      imageUrl:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : null,
    })),
  };
}

export async function generateMetadata({
  params,
}: SellerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSellerProfile(id);

  if (!seller) {
    return {
      title: "Seller Not Found",
      description: "This artisan profile could not be found on Handcrafted Haven.",
    };
  }

  return {
    title: seller.name,
    description:
      seller.bio || "View artisan profile details and handmade collections.",
  };
}

export default async function SellerProfilePage({
  params,
}: SellerProfilePageProps) {
  const { id } = await params;
  const seller = await getSellerProfile(id);
  const session = await getServerSessionFromCookies();

  if (!seller) {
    notFound();
  }

  const canEditProfile = isSellerOwner(session, seller.id);

  return (
    <main className={styles.main}>
      <Link className={styles.backLink} href="/sellers">
        ← Back to Sellers
      </Link>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Seller Profile</p>
        <h1 className={styles.title}>{seller.name}</h1>
        <p className={styles.bio}>{seller.bio}</p>
        {canEditProfile ? (
          <Link className={styles.productLink} href="/dashboard/profile">
            Edit Profile
          </Link>
        ) : null}
      </section>

      <section className={styles.storySection}>
        <h2 className={styles.sectionTitle}>Story</h2>
        <p className={styles.storyText}>{seller.story}</p>
      </section>

      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Products by {seller.name}</h2>

        {seller.products.length === 0 ? (
          <p className={styles.emptyState}>
            No products are available from this seller yet.
          </p>
        ) : (
          <div className={styles.grid}>
            {seller.products.map((product) => (
              <article className={styles.card} key={product.id}>
                <div className={styles.imageFrame}>
                  <Image
                    src={getProductImageSrc(product.imageUrl)}
                    alt={product.name}
                    className={styles.image}
                    fill
                    sizes="(max-width: 640px) 100vw, 240px"
                  />
                </div>

                <h3 className={styles.cardTitle}>{product.name}</h3>
                <p className={styles.meta}>
                  <strong>Category:</strong> {formatCategory(product.category)}
                </p>
                <p className={styles.meta}>
                  <strong>Price:</strong>{" "}
                  {product.price !== null ? `$${product.price.toFixed(2)}` : "N/A"}
                </p>
                <p className={styles.description}>
                  {product.description.length > 100
                    ? `${product.description.slice(0, 100)}...`
                    : product.description}
                </p>

                <Link className={styles.productLink} href={`/products/${product.id}`}>
                  View Product
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImageSrc } from "@/src/lib/product-image";
import styles from "./DashboardClient.module.css";
import { formatCategory, type ProductCategory } from "./dashboard-data";
import { useSession } from "../SessionProvider";

type SellerRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
    }
  | null
  | undefined;

type DashboardProduct = {
  _id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  images?: string[];
  inStock?: boolean;
  sellerId?: SellerRef;
};

type ProductsResponse = {
  products?: DashboardProduct[];
  error?: string;
};

function getSellerId(value: SellerRef): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export default function DashboardClient() {
  const { session } = useSession();
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        if (session?.user.role !== "seller" || !session.user.id) {
          setErrorMessage("Please log in as a seller to manage products.");
          setProducts([]);
          return;
        }

        const response = await fetch("/api/products?limit=100", {
          cache: "no-store",
        });

        const data: ProductsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load products.");
        }

        const allProducts = Array.isArray(data.products) ? data.products : [];

        const sellerProducts = allProducts.filter(
          (product) => getSellerId(product.sellerId) === session.user.id,
        );

        setProducts(sellerProducts);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load products.",
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [session]);

  async function handleDelete(productId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = session?.token;

      if (!token) {
        setErrorMessage("Please log in again before deleting a product.");
        return;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product.");
      }

      setProducts((current) =>
        current.filter((product) => product._id !== productId),
      );
      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      console.error("Dashboard delete error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete product.",
      );
    }
  }

  return (
    <main id="main-content" className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Seller Dashboard</h1>
          <p className={styles.intro}>
            Manage your live product listings here, create new items, and update
            or remove products from your storefront.
          </p>
        </div>
        <Link className={styles.button} href="/dashboard/products/new">
          Add Product
        </Link>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>My Products</h2>
        <p className={styles.panelText}>
          Review your current listings, open edit mode, or remove a product from
          your store.
        </p>

        {errorMessage && (
          <p className={styles.errorText} role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className={styles.successText} aria-live="polite">
            {successMessage}
          </p>
        )}

        {loading ? (
          <p className={styles.emptyState}>Loading your products...</p>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            No products yet. Create your first product listing.
          </div>
        ) : (
          <div className={`${styles.productList} ${styles.productListRows}`}>
            {products.map((product) => {
              const imageUrl =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : "";

              return (
                <article
                  className={`${styles.productCard} ${styles.productCardListView}`}
                  key={product._id}
                >
                  <div className={`${styles.imageFrame} ${styles.imageFrameList}`}>
                    <Image
                      alt={product.name || "Product image"}
                      className={styles.image}
                      src={getProductImageSrc(imageUrl)}
                      fill
                      sizes="92px"
                    />
                  </div>

                  <div className={styles.productBody}>
                    <div className={styles.productHeader}>
                      <div>
                        <h3 className={styles.productName}>
                          {product.name || "Unnamed product"}
                        </h3>
                        <p className={styles.helperText}>
                          {product.inStock ? "In stock" : "Out of stock"}
                        </p>
                      </div>
                      <span className={styles.badge}>
                        {formatCategory(product.category || "other")}
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      <span>
                        {typeof product.price === "number"
                          ? `$${product.price.toFixed(2)}`
                          : "Price unavailable"}
                      </span>
                      <span>
                        {product.inStock
                          ? "Ready to sell"
                          : "Currently unavailable"}
                      </span>
                    </div>

                    <p className={styles.description}>
                      {product.description || "No description available."}
                    </p>

                    <div className={styles.cardActions}>
                      <Link
                        className={styles.button}
                        href={`/dashboard/products/${product._id}/edit`}
                      >
                        Edit Product
                      </Link>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Link className={styles.backLink} href="/">
        ← Back to Home
      </Link>
    </main>
  );
}
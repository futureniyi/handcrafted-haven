"use client";

import Link from "next/link";
import styles from "./DashboardClient.module.css";
import { formatCategory } from "./dashboard-data";
import { useMockSellerProducts } from "./useMockSellerProducts";

export default function DashboardClient() {
  const { deleteProduct, isReady, products, resetProducts } = useMockSellerProducts();

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Seller Dashboard</h1>
          <p className={styles.intro}>
            Manage your mock product listings here. Use the create and edit routes to
            model the same flow you will later wire to the backend.
          </p>
        </div>
        <Link className={styles.button} href="/dashboard/products/new">
          Add Product
        </Link>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>My Products</h2>
        <p className={styles.panelText}>
          Review your current listings, jump into edit mode, or remove a mock product
          from the dashboard state.
        </p>

        {!isReady ? (
          <p className={styles.emptyState}>Loading your mock products...</p>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            No products yet. Create your first mock listing to test the seller flow.
          </div>
        ) : (
          <div className={`${styles.productList} ${styles.productListRows}`}>
            {products.map((product) => (
              <article className={`${styles.productCard} ${styles.productCardListView}`} key={product.id}>
                <div className={`${styles.imageFrame} ${styles.imageFrameList}`}>
                  {product.imageUrl ? (
                    <img
                      alt={product.name}
                      className={styles.image}
                      src={product.imageUrl}
                    />
                  ) : (
                    <span className={styles.imageFallback}>No image preview available</span>
                  )}
                </div>

                <div className={styles.productBody}>
                  <div className={styles.productHeader}>
                    <div>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.helperText}>
                        {product.inStock ? "In stock" : "Out of stock"}
                      </p>
                    </div>
                    <span className={styles.badge}>{formatCategory(product.category)}</span>
                  </div>

                  <div className={styles.metaRow}>
                    <span>${product.price}</span>
                    <span>{product.inStock ? "Ready to sell" : "Currently unavailable"}</span>
                  </div>

                  <p className={styles.description}>{product.description}</p>

                  <div className={styles.cardActions}>
                    <Link
                      className={styles.button}
                      href={`/dashboard/products/${product.id}/edit`}
                    >
                      Edit Product
                    </Link>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Remove Mock Product
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.cardActions}>
          <button className={styles.secondaryButton} type="button" onClick={resetProducts}>
            Reset Mock Data
          </button>
        </div>
      </section>

      <Link className={styles.backLink} href="/">
        ← Back to Home
      </Link>
    </main>
  );
}

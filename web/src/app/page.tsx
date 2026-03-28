import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Discover Handmade Goods",
  description:
    "Explore Handcrafted Haven to discover handmade goods, browse artisan collections, and connect with independent sellers.",
};

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>A marketplace for handmade items</p>

        <h1 className={styles.title}>Handcrafted Haven</h1>

        <p className={styles.intro}>
          Handcrafted Haven is an online marketplace where artisans can share and sell
          handmade products. Browse unique items, filter by category and price, and
          leave ratings and reviews.
        </p>

        <div className={styles.actions}>
          <Link href="/catalog" className={styles.primaryLink}>
            Browse Products
          </Link>

          <Link href="/sellers" className={styles.secondaryLink}>
            Meet Sellers
          </Link>
        </div>

        <p className={styles.note}>Note: Catalog/Sellers pages will be added next.</p>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How it works</h2>

        <div className={styles.stepsGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>1) Browse</h3>
            <p className={styles.cardText}>
              Explore handmade products in the catalog and discover unique items.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>2) Compare</h3>
            <p className={styles.cardText}>
              View details like price, description, category, and seller info.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>3) Review</h3>
            <p className={styles.cardText}>
              Leave a 1–5 star rating and a written review to help others.
            </p>
          </div>
        </div>
      </section>

      {/* For sellers */}
      <section className={styles.section}>
        <h2 className={styles.sellerTitle}>For Sellers</h2>
        <p className={styles.sellerText}>
          Sellers will have their own profile page and can manage product listings
          (title, description, price, category, and image). Seller-only actions will
          require login.
        </p>
      </section>

      {/* Footer note */}
      <footer className={styles.footer}>Built with Next.js • Deployed on Vercel</footer>
    </main>
  );
}

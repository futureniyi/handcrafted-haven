import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sellers",
  description:
    "Meet the artisans behind Handcrafted Haven and explore seller profiles, creative stories, and handmade collections.",
};

type SellerListItem = {
  id: string;
  name: string;
  bio: string;
  story: string;
};

async function getSellers(): Promise<SellerListItem[]> {
  await dbConnect();

  const sellers = await User.find({ role: "seller" })
    .select("name bio story")
    .sort({ createdAt: -1 })
    .limit(24);

  return sellers.map((seller) => ({
    id: seller._id.toString(),
    name: seller.name || "Seller",
    bio: seller.bio || "This artisan has not added a short bio yet.",
    story: seller.story || "",
  }));
}

export default async function SellersPage() {
  const sellers = await getSellers();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Sellers</h1>
        <p className={styles.intro}>
          Explore the artisans behind Handcrafted Haven, read about their creative
          process, and jump into each seller profile to see their products.
        </p>
      </section>

      {sellers.length === 0 ? (
        <p className={styles.empty}>
          No sellers are available yet. Once artisan accounts are created, they will
          appear here.
        </p>
      ) : (
        <section className={styles.grid}>
          {sellers.map((seller) => (
            <article className={styles.card} key={seller.id}>
              <h2 className={styles.name}>{seller.name}</h2>
              <p className={styles.meta}>Artisan Profile</p>
              <p className={styles.bio}>{seller.bio}</p>
              <p className={styles.story}>
                {seller.story
                  ? seller.story.length > 140
                    ? `${seller.story.slice(0, 140)}...`
                    : seller.story
                  : "The seller story will appear here once it has been added."}
              </p>
              <Link className={styles.link} href={`/sellers/${seller.id}`}>
                View Seller Profile
              </Link>
            </article>
          ))}
        </section>
      )}

      <p className={styles.backWrap}>
        <Link className={styles.link} href="/">
          ← Back to Home
        </Link>
      </p>
    </main>
  );
}

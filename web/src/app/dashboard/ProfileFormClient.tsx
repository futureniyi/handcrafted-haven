"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { useSession } from "../SessionProvider";
import styles from "./DashboardClient.module.css";

type ProfileFormClientProps = {
  seller: SessionUser;
};

type SellerProfileResponse = {
  seller?: {
    id: string;
    name: string;
    bio?: string;
    story?: string;
  };
  error?: string;
};

export default function ProfileFormClient({
  seller,
}: ProfileFormClientProps) {
  const router = useRouter();
  const { session, updateSessionUser } = useSession();
  const [bio, setBio] = useState(seller.bio || "");
  const [story, setStory] = useState(seller.story || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      setErrorMessage("Please log in as a seller before updating your profile.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`/api/sellers/${seller.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          bio: bio.trim(),
          story: story.trim(),
        }),
      });

      const data: SellerProfileResponse = await response.json();

      if (!response.ok || !data.seller) {
        throw new Error(data.error || "Failed to update profile.");
      }

      updateSessionUser({
        bio: data.seller.bio || "",
        story: data.seller.story || "",
      });
      setSuccessMessage("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.panel}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.panelTitle}>Edit Seller Profile</h1>
            <p className={styles.panelText}>
              Update your public artisan bio and story. Your account name and email
              stay tied to your login.
            </p>
          </div>
          <Link className={styles.secondaryButton} href={`/sellers/${seller.id}`}>
            View Public Profile
          </Link>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="seller-name">
                Seller name
              </label>
              <input
                id="seller-name"
                className={styles.input}
                value={seller.name}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="seller-email">
                Email
              </label>
              <input
                id="seller-email"
                className={styles.input}
                value={seller.email}
                readOnly
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="seller-bio">
              Bio
            </label>
            <textarea
              id="seller-bio"
              className={styles.textarea}
              maxLength={500}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
            <p className={styles.helperText}>Short public intro. Max 500 characters.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="seller-story">
              Story
            </label>
            <textarea
              id="seller-story"
              className={styles.textarea}
              maxLength={2000}
              value={story}
              onChange={(event) => setStory(event.target.value)}
            />
            <p className={styles.helperText}>
              Longer public story for your seller page. Max 2000 characters.
            </p>
          </div>

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

          <div className={styles.cardActions}>
            <button className={styles.button} disabled={submitting} type="submit">
              {submitting ? "Saving..." : "Save Profile"}
            </button>
            <Link className={styles.secondaryButton} href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
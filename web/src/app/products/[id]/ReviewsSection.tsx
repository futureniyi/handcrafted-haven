"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useSession } from "../../SessionProvider";

type ReviewAuthor = {
  _id?: string;
  name?: string;
};

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  userId?: ReviewAuthor;
};

type ReviewsResponse = {
  reviews?: Review[];
  stats?: {
    total?: number;
    average?: number;
  };
  error?: string;
};

type ReviewsSectionProps = {
  productId: string;
  sellerId: string;
};

type ReviewForm = {
  rating: string;
  comment: string;
};

const defaultForm: ReviewForm = {
  rating: "5",
  comment: "",
};

function formatReviewDate(value?: string) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function ReviewsSection({
  productId,
  sellerId,
}: ReviewsSectionProps) {
  const { session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ReviewForm>(defaultForm);
  const isProductOwner = session?.user.role === "seller" && session.user.id === sellerId;

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/products/${productId}/reviews`, {
        cache: "no-store",
      });

      const data: ReviewsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load reviews");
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setAverageRating(data.stats?.average ?? 0);
      setTotalReviews(data.stats?.total ?? 0);
    } catch (loadError) {
      console.error("Reviews load error:", loadError);
      setError("Failed to load reviews.");
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  function updateForm<Field extends keyof ReviewForm>(
    field: Field,
    value: ReviewForm[Field],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setSubmitError("");

      const token = session?.token;

      if (!token) {
        setSubmitError("Please log in to submit a review.");
        return;
      }

      if (isProductOwner) {
        setSubmitError("You cannot review your own product.");
        return;
      }

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      });

      const data: Review | ReviewsResponse = await response.json();

      if (!response.ok) {
        const message =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Failed to submit review";
        throw new Error(message);
      }

      setForm(defaultForm);
      await loadReviews();
    } catch (submitReviewError) {
      console.error("Review submit error:", submitReviewError);
      setSubmitError(
        submitReviewError instanceof Error
          ? submitReviewError.message
          : "Failed to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.reviews} aria-labelledby="reviews-title">
      <div className={styles.reviewsHeader}>
        <div>
          <h2 className={styles.reviewsTitle} id="reviews-title">
            Reviews
          </h2>
          <p className={styles.reviewsSummary}>
            {totalReviews > 0
              ? `${averageRating.toFixed(1)} out of 5 from ${totalReviews} review${
                  totalReviews === 1 ? "" : "s"
                }`
              : "No reviews yet. Be the first to rate this product."}
          </p>
        </div>
        <div className={styles.ratingBadge} aria-label={`Average rating ${averageRating} out of 5`}>
          <span className={styles.ratingValue}>
            {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
          </span>
          <span className={styles.ratingStars}>
            {renderStars(Math.round(averageRating))}
          </span>
        </div>
      </div>

      <div className={styles.reviewsGrid}>
        <div className={styles.reviewListBlock}>
          <h3 className={styles.reviewSectionHeading}>What customers are saying</h3>

          {loading && <p className={styles.reviewsText}>Loading reviews...</p>}
          {!loading && error && <p className={styles.reviewError}>{error}</p>}

          {!loading && !error && reviews.length === 0 && (
            <p className={styles.reviewsText}>
              There are no reviews yet for this product.
            </p>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className={styles.reviewList}>
              {reviews.map((review) => (
                <article className={styles.reviewCard} key={review._id}>
                  <div className={styles.reviewCardHeader}>
                    <div>
                      <p className={styles.reviewAuthor}>
                        {review.userId?.name || "Anonymous customer"}
                      </p>
                      <p className={styles.reviewDate}>
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                    <div className={styles.reviewRatingBlock}>
                      <span className={styles.reviewRatingValue}>{review.rating}/5</span>
                      <span className={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </span>
                    </div>
                  </div>

                  <p className={styles.reviewComment}>
                    {review.comment?.trim() || "No written comment provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className={styles.reviewFormBlock}>
          <h3 className={styles.reviewSectionHeading}>Leave a review</h3>
          <p className={styles.reviewHelper}>
            {isProductOwner
              ? "This is your product, so reviews are disabled for the owner."
              : "Use a 1 to 5 rating and share a short comment about the product."}
          </p>

          <form className={styles.reviewForm} onSubmit={handleSubmit}>
            <div className={styles.reviewField}>
              <label className={styles.reviewLabel} htmlFor="review-rating">
                Rating
              </label>
              <select
                id="review-rating"
                className={styles.reviewSelect}
                value={form.rating}
                onChange={(event) => updateForm("rating", event.target.value)}
                disabled={isProductOwner || submitting}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div className={styles.reviewField}>
              <label className={styles.reviewLabel} htmlFor="review-comment">
                Comment
              </label>
              <textarea
                id="review-comment"
                className={styles.reviewTextarea}
                value={form.comment}
                maxLength={500}
                placeholder="Share what you liked, how it arrived, or who you would recommend it to."
                onChange={(event) => updateForm("comment", event.target.value)}
                disabled={isProductOwner || submitting}
              />
            </div>

            {submitError && <p className={styles.reviewError}>{submitError}</p>}

            <button
              className={styles.reviewButton}
              disabled={isProductOwner || submitting}
              type="submit"
            >
              {isProductOwner
                ? "Owners Cannot Review"
                : submitting
                  ? "Submitting..."
                  : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

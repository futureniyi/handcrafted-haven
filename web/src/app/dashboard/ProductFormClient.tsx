"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./DashboardClient.module.css";
import {
  categoryOptions,
  defaultFormState,
  type ProductCategory,
  type ProductFormState,
} from "./dashboard-data";
import { useSession } from "../SessionProvider";

type ProductFormClientProps = {
  mode: "create" | "edit";
  productId?: string;
};

type ProductApiResponse = {
  _id?: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  inStock?: boolean;
  error?: string;
};

type UploadApiResponse = {
  url?: string;
  error?: string;
};

function isProductCategory(value: string): value is ProductCategory {
  return ["jewelry", "clothing", "home-decor", "art", "other"].includes(value);
}

function mapProductToForm(product: ProductApiResponse): ProductFormState {
  const rawCategory = product.category ?? "";
  const category: ProductCategory = isProductCategory(rawCategory)
    ? rawCategory
    : "other";

  return {
    name: product.name || "",
    description: product.description || "",
    price:
      typeof product.price === "number" && Number.isFinite(product.price)
        ? String(product.price)
        : "",
    category,
    imageUrl:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "",
    inStock: product.inStock ?? true,
  };
}

export default function ProductFormClient({
  mode,
  productId,
}: ProductFormClientProps) {
  const router = useRouter();
  const { session } = useSession();

  const [form, setForm] = useState<ProductFormState>(defaultFormState);
  const [initialForm, setInitialForm] = useState<ProductFormState>(defaultFormState);
  const [loadingProduct, setLoadingProduct] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (mode !== "edit" || !productId) {
        setLoadingProduct(false);
        return;
      }

      try {
        setLoadingProduct(true);
        setErrorMessage("");

        const response = await fetch(`/api/products/${productId}`, {
          cache: "no-store",
        });

        const data: ProductApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load product.");
        }

        const mapped = mapProductToForm(data);
        setForm(mapped);
        setInitialForm(mapped);
      } catch (error) {
        console.error("Product form load error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load product.",
        );
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, [mode, productId]);

  function updateForm<Field extends keyof ProductFormState>(
    field: Field,
    value: ProductFormState[Field],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReset() {
    if (mode === "edit") {
      setForm(initialForm);
      setFileInputKey((current) => current + 1);
      return;
    }

    setForm(defaultFormState);
    setFileInputKey((current) => current + 1);
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const token = session?.token;

    if (!token) {
      setErrorMessage("Please log in as a seller before uploading an image.");
      setFileInputKey((current) => current + 1);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Only JPG, PNG, and WebP files are supported.");
      setFileInputKey((current) => current + 1);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File must be less than 5MB.");
      setFileInputKey((current) => current + 1);
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage("");
      setStatusMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data: UploadApiResponse = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image.");
      }

      updateForm("imageUrl", data.url);
      setStatusMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Product image upload error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      setUploadingImage(false);
      setFileInputKey((current) => current + 1);
    }
  }

  function handleRemoveImage() {
    updateForm("imageUrl", "");
    setStatusMessage("");
    setErrorMessage("");
    setFileInputKey((current) => current + 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (uploadingImage) {
      setErrorMessage("Please wait for the image upload to finish.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setStatusMessage("");

      const token = session?.token;

      if (!token) {
        setErrorMessage("Please log in as a seller before saving a product.");
        return;
      }

      const parsedPrice = Number(form.price);

      if (!form.name.trim()) {
        setErrorMessage("Product name is required.");
        return;
      }

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setErrorMessage("Price must be a valid non-negative number.");
        return;
      }

      const trimmedImageUrl = form.imageUrl.trim();

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parsedPrice,
        category: form.category,
        images: trimmedImageUrl ? [trimmedImageUrl] : [],
        inStock: form.inStock,
      };

      const endpoint =
        mode === "create" ? "/api/products" : `/api/products/${productId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data: ProductApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (mode === "create"
              ? "Failed to create product."
              : "Failed to update product."),
        );
      }

      setStatusMessage(
        mode === "create"
          ? "Product created successfully. Returning to dashboard..."
          : "Product updated successfully. Returning to dashboard...",
      );

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Product form submit error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save product.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const heading = mode === "create" ? "Add Product" : "Edit Product";
  const description =
    mode === "create"
      ? "Create a new live product listing for your storefront."
      : "Update your existing product listing.";

  if (loadingProduct) {
    return (
      <main id="main-content" className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.panelTitle}>{heading}</h1>
              <p className={styles.panelText}>Loading product details...</p>
            </div>
            <Link className={styles.secondaryButton} href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.panel}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.panelTitle}>{heading}</h1>
            <p className={styles.panelText}>{description}</p>
          </div>
          <Link className={styles.secondaryButton} href="/dashboard">
            Back to Dashboard
          </Link>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="product-name">
              Product name
            </label>
            <input
              id="product-name"
              className={styles.input}
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="product-description">
              Description
            </label>
            <textarea
              id="product-description"
              className={styles.textarea}
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              required
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-price">
                Price
              </label>
              <input
                id="product-price"
                className={styles.input}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-category">
                Category
              </label>
              <select
                id="product-category"
                className={styles.select}
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value as ProductCategory)
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="product-image-upload">
              Product image
            </label>
            <input
              key={fileInputKey}
              id="product-image-upload"
              className={styles.input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage || submitting}
            />
            <p className={styles.helperText}>
              Upload a JPG, PNG, or WebP image up to 5MB.
            </p>
            {form.imageUrl ? (
              <div className={styles.uploadPreview}>
                <div className={styles.uploadPreviewFrame}>
                  <Image
                    alt={`${form.name || "Product"} preview`}
                    className={styles.uploadPreviewImage}
                    src={form.imageUrl}
                    fill
                    sizes="120px"
                  />
                </div>
                <div className={styles.uploadPreviewBody}>
                  <p className={styles.uploadPreviewText}>
                    {uploadingImage ? "Uploading image..." : "Image ready"}
                  </p>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage || submitting}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <label className={styles.checkboxRow} htmlFor="product-in-stock">
            <input
              id="product-in-stock"
              type="checkbox"
              checked={form.inStock}
              onChange={(event) => updateForm("inStock", event.target.checked)}
            />
            <span>Product is in stock</span>
          </label>

          {errorMessage && (
            <p className={styles.errorText} role="alert">
              {errorMessage}
            </p>
          )}

          {statusMessage && (
            <p className={styles.successText} aria-live="polite">
              {statusMessage}
            </p>
          )}

          <div className={styles.cardActions}>
            <button
              className={styles.button}
              disabled={submitting || uploadingImage}
              type="submit"
            >
              {submitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : uploadingImage
                  ? "Uploading Image..."
                  : mode === "create"
                    ? "Create Product"
                    : "Save Changes"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleReset}
              disabled={submitting || uploadingImage}
            >
              Reset Form
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
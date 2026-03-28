"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./DashboardClient.module.css";
import {
  categoryOptions,
  defaultFormState,
  toFormState,
  type ProductCategory,
  type ProductFormState,
} from "./dashboard-data";
import { useMockSellerProducts } from "./useMockSellerProducts";

type ProductFormClientProps = {
  mode: "create" | "edit";
  productId?: string;
};

export default function ProductFormClient({
  mode,
  productId,
}: ProductFormClientProps) {
  const router = useRouter();
  const { createProduct, getProductById, updateProduct } = useMockSellerProducts();
  const selectedProduct = mode === "edit" && productId ? getProductById(productId) : null;
  const [form, setForm] = useState<ProductFormState>(() =>
    selectedProduct ? toFormState(selectedProduct) : defaultFormState,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (mode === "edit" && productId && !selectedProduct) {
    return (
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.panelTitle}>Edit Product</h1>
              <p className={styles.panelText}>
                This product could not be found in your current mock dashboard data.
              </p>
            </div>
            <Link className={styles.secondaryButton} href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
    if (mode === "edit" && productId) {
      const product = getProductById(productId);
      if (product) {
        setForm(toFormState(product));
      }
      return;
    }

    setForm(defaultFormState);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (mode === "edit") {
      if (!productId) {
        setErrorMessage("No product selected for editing.");
        return;
      }

      updateProduct(productId, form);
      setStatusMessage("Mock product updated. Returning to your dashboard...");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    createProduct(form);
    setStatusMessage("Mock product created. Returning to your dashboard...");
    router.push("/dashboard");
    router.refresh();
  }

  const heading = mode === "create" ? "Add Product" : "Edit Product";
  const description =
    mode === "create"
      ? "Create a new listing with the same fields expected by the product API."
      : "Update the selected mock product before wiring this flow to the backend.";

  return (
    <main className={styles.main}>
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
            <label className={styles.label} htmlFor="product-image-url">
              Image URL
            </label>
            <input
              id="product-image-url"
              className={styles.input}
              type="url"
              value={form.imageUrl}
              onChange={(event) => updateForm("imageUrl", event.target.value)}
            />
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

          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
          {statusMessage && <p className={styles.successText}>{statusMessage}</p>}

          <div className={styles.cardActions}>
            <button className={styles.button} type="submit">
              {mode === "create" ? "Create Product" : "Save Changes"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleReset}
            >
              Reset Form
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

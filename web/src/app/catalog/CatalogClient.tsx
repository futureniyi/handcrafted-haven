"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImageSrc } from "@/src/lib/product-image";
import styles from "./CatalogClient.module.css";

type Product = {
  _id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  inStock?: boolean;
};

type ProductFilters = {
  category: string;
  minPrice: string;
  maxPrice: string;
};

type ProductsResponse = {
  products?: Product[];
  pagination?: {
    total?: number;
  };
};

const categoryOptions = [
  { value: "jewelry", label: "Jewelry" },
  { value: "clothing", label: "Clothing" },
  { value: "home-decor", label: "Home Decor" },
  { value: "art", label: "Art" },
  { value: "other", label: "Other" },
];

const defaultFilters: ProductFilters = {
  category: "",
  minPrice: "",
  maxPrice: "",
};

function hasActiveFilters(filters: ProductFilters) {
  return Boolean(filters.category || filters.minPrice || filters.maxPrice);
}

function buildProductQueryParams(filters: ProductFilters) {
  const params = new URLSearchParams({
    limit: "100",
  });

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  return params;
}

export default function CatalogClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductFilters>(defaultFilters);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const queryParams = buildProductQueryParams(appliedFilters);

        const res = await fetch(`/api/products?${queryParams.toString()}`, {
          cache: "no-store",
        });

        const data: ProductsResponse | Product[] = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        if (Array.isArray(data)) {
          setProducts(data);
          setTotalProducts(data.length);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalProducts(data.pagination?.total ?? data.products.length);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error("Catalog load error:", err);
        setError("Failed to load products.");
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [appliedFilters]);

  function updateDraftFilter(
    field: keyof ProductFilters,
    value: ProductFilters[keyof ProductFilters],
  ) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  }

  function handleClearFilters() {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  }

  const activeFilters = [
    draftFilters.category
      ? categoryOptions.find((category) => category.value === draftFilters.category)?.label
      : null,
    draftFilters.minPrice ? `Min $${draftFilters.minPrice}` : null,
    draftFilters.maxPrice ? `Max $${draftFilters.maxPrice}` : null,
  ].filter(Boolean);

  return (
    <main className={styles.main}>
      <h1>Catalog</h1>

      <p className={styles.intro}>
        Browse handmade products from our sellers.
      </p>

      <form className={styles.filters} onSubmit={handleApplyFilters}>
        <div className={styles.filtersHeader}>
          <div>
            <h2 className={styles.filtersTitle}>Shop by filter</h2>
            <p className={styles.filtersText}>
              Narrow the catalog by category or price range, then apply the filters to
              refresh the product grid.
            </p>
          </div>
          {hasActiveFilters(draftFilters) && (
            <button
              className={styles.inlineClear}
              type="button"
              onClick={handleClearFilters}
            >
              Clear all
            </button>
          )}
        </div>

        <div className={styles.filterSection}>
          <label className={styles.label}>Category</label>
          <div className={styles.categoryChips} role="group" aria-label="Filter by category">
            <button
              className={`${styles.chip} ${draftFilters.category === "" ? styles.chipActive : ""}`}
              type="button"
              onClick={() => updateDraftFilter("category", "")}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category.value}
                className={`${styles.chip} ${
                  draftFilters.category === category.value ? styles.chipActive : ""
                }`}
                type="button"
                onClick={() => updateDraftFilter("category", category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="min-price">
              Min price
            </label>
            <input
              id="min-price"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={draftFilters.minPrice}
              onChange={(event) => updateDraftFilter("minPrice", event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="max-price">
              Max price
            </label>
            <input
              id="max-price"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="500.00"
              value={draftFilters.maxPrice}
              onChange={(event) => updateDraftFilter("maxPrice", event.target.value)}
            />
          </div>
        </div>

        <div className={styles.actionsRow}>
          <div className={styles.activePills} aria-live="polite">
            {activeFilters.length > 0 ? (
              activeFilters.map((filter) => (
                <span className={styles.activePill} key={filter}>
                  {filter}
                </span>
              ))
            ) : (
              <span className={styles.activeHint}>No filters selected</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>

          <button className={styles.button} type="submit">
            Apply Filters
          </button>
        </div>
      </form>

      {loading && <p>Loading products...</p>}

      {!loading && error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      {!loading && !error && products.length > 0 && (
        <div className={styles.resultsBar}>
          <p className={styles.resultsSummary}>
            Showing {products.length} of {totalProducts} products.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <section className={styles.grid}>
          {products.map((product) => (
            <article
              key={product._id}
              className={styles.card}
            >
              <div className={styles.imageFrame}>
                <Image
                  src={getProductImageSrc(product.images?.[0])}
                  alt={product.name || "Product image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 240px"
                  className={styles.image}
                />
              </div>

              <h2 className={styles.cardTitle}>
                {product.name || "Unnamed product"}
              </h2>

              <p className={styles.meta}>
                <strong>Category:</strong> {product.category || "Other"}
              </p>

              <p className={styles.meta}>
                <strong>Price:</strong>{" "}
                {typeof product.price === "number"
                  ? `$${product.price.toFixed(2)}`
                  : "N/A"}
              </p>

              <p className={styles.description}>
                {product.description
                  ? product.description.length > 100
                    ? `${product.description.slice(0, 100)}...`
                    : product.description
                  : "No description available."}
              </p>

              <Link className={styles.link} href={`/products/${product._id}`}>
                View Details
              </Link>
            </article>
          ))}
        </section>
      )}

      <p className={styles.backLinkWrap}>
        <Link className={styles.link} href="/">
          ← Back to Home
        </Link>
      </p>
    </main>
  );
}

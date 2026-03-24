"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  _id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  inStock?: boolean;
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load products");
        }

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Catalog load error:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 980, margin: "0 auto" }}>
      <h1>Catalog</h1>

      <p style={{ marginBottom: "1.5rem" }}>
        Browse handmade products from our sellers.
      </p>

      {loading && <p>Loading products...</p>}

      {!loading && error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {products.map((product) => (
            <article
              key={product._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  backgroundColor: "#f3f3f3",
                  borderRadius: "6px",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name || "Product image"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span>No image</span>
                )}
              </div>

              <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                {product.name || "Unnamed product"}
              </h2>

              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>Category:</strong> {product.category || "Other"}
              </p>

              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>Price:</strong>{" "}
                {typeof product.price === "number"
                  ? `$${product.price.toFixed(2)}`
                  : "N/A"}
              </p>

              <p style={{ marginBottom: "0.75rem" }}>
                {product.description
                  ? product.description.length > 100
                    ? product.description.slice(0, 100) + "..."
                    : product.description
                  : "No description available."}
              </p>

              <Link href={`/products/${product._id}`}>View Details</Link>
            </article>
          ))}
        </section>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/">← Back to Home</Link>
      </p>
    </main>
  );
}
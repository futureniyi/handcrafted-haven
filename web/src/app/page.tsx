export default function Home() {
  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 980, margin: "0 auto" }}>
      {/* Hero */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "2rem",
          background: "#E6E6FA",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>
          A marketplace for handmade items
        </p>

        <h1 style={{ margin: "0.5rem 0 0.75rem", fontSize: 40, lineHeight: 1.1 }}>
          Handcrafted Haven
        </h1>

        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, maxWidth: 720 }}>
          Handcrafted Haven is an online marketplace where artisans can share and sell
          handmade products. Browse unique items, filter by category and price, and
          leave ratings and reviews.
        </p>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href="/catalog"
            style={{
              display: "inline-block",
              padding: "0.7rem 1rem",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Browse Products
          </a>

          <a
            href="/sellers"
            style={{
              display: "inline-block",
              padding: "0.7rem 1rem",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#111827",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Meet Sellers
          </a>
        </div>

        <p style={{ marginTop: "0.75rem", fontSize: 13, opacity: 0.75 }}>
          Note: Catalog/Sellers pages will be added next.
        </p>
      </section>

      {/* How it works */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.75rem" }}>How it works</h2>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>1) Browse</h3>
            <p style={cardTextStyle}>
              Explore handmade products in the catalog and discover unique items.
            </p>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>2) Compare</h3>
            <p style={cardTextStyle}>
              View details like price, description, category, and seller info.
            </p>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>3) Review</h3>
            <p style={cardTextStyle}>
              Leave a 1–5 star rating and a written review to help others.
            </p>
          </div>
        </div>
      </section>

      {/* For sellers */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem" }}>For Sellers</h2>
        <p style={{ margin: 0, lineHeight: 1.6, maxWidth: 820 }}>
          Sellers will have their own profile page and can manage product listings
          (title, description, price, category, and image). Seller-only actions will
          require login.
        </p>
      </section>

      {/* Footer note */}
      <footer style={{ marginTop: "2rem", fontSize: 13, opacity: 0.75 }}>
        Built with Next.js • Deployed on Vercel
      </footer>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "1rem",
  background: "#E6E6FA",
};

const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 0.4rem",
  fontSize: 16,
};

const cardTextStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  opacity: 0.9,
};
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AppHeader.module.css";
import { useSession } from "./SessionProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/sellers", label: "Sellers" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clearSession, isAuthenticated, isSeller } = useSession();

  async function handleLogout() {
    await clearSession();
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <Link className={styles.brand} href="/">
            Handcrafted Haven
          </Link>

          <button
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className={styles.menuButton}
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </button>
        </div>

        <nav
          aria-label="Primary"
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
          id="primary-navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={`${styles.link} ${isActive(pathname, item.href) ? styles.active : ""}`}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {isSeller ? (
            <Link
              className={`${styles.link} ${isActive(pathname, "/dashboard") ? styles.active : ""}`}
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : null}

          {isAuthenticated ? (
            <button className={styles.authButton} onClick={handleLogout} type="button">
              Logout
            </button>
          ) : (
            <>
              <Link
                className={`${styles.link} ${isActive(pathname, "/login") ? styles.active : ""}`}
                href="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                className={`${styles.link} ${isActive(pathname, "/register") ? styles.active : ""}`}
                href="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

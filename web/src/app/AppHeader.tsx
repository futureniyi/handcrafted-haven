"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AppHeader.module.css";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(window.localStorage.getItem("token")));
    }

    syncAuthState();
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  function handleLogout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setIsLoggedIn(false);
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

          {isLoggedIn ? (
            <button className={styles.authButton} onClick={handleLogout} type="button">
              Logout
            </button>
          ) : (
            <Link
              className={`${styles.link} ${isActive(pathname, "/login") ? styles.active : ""}`}
              href="/login"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

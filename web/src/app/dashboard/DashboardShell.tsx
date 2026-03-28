"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DashboardShell.module.css";

const dashboardLinks = [
  { href: "/dashboard", label: "My Products" },
  { href: "/dashboard/products/new", label: "Add Product" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Seller Workspace</h2>
          <p className={styles.sidebarText}>
            Use the dashboard navigation to manage listings and move between seller
            tools.
          </p>

          <nav aria-label="Dashboard" className={styles.nav}>
            {dashboardLinks.map((item) => (
              <Link
                key={item.href}
                className={`${styles.link} ${isActive(pathname, item.href) ? styles.active : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

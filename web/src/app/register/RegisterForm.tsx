"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth-form.module.css";
import { useSession } from "../SessionProvider";

type RegisterResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const { setSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "seller">("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error || "Registration failed");
      }

      setSession({
        token: data.token,
        user: {
          ...data.user,
          role: data.user.role === "seller" ? "seller" : "user",
        },
      });

      const nextPath = data.user.role === "seller" ? "/dashboard" : "/catalog";

      setSuccess(
        `Registration successful. Redirecting to ${
          data.user.role === "seller" ? "your dashboard" : "the catalog"
        }...`,
      );
      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to register.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.intro}>
          Create an account to browse handmade goods, leave reviews, or start selling
          your own products.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-name">
              Full name
            </label>
            <input
              id="register-name"
              className={styles.input}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-role">
              Account type
            </label>
            <select
              id="register-role"
              className={styles.select}
              value={role}
              onChange={(event) => setRole(event.target.value as "user" | "seller")}
            >
              <option value="user">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className={styles.success} aria-live="polite">
              {success}
            </p>
          )}

          <button className={styles.button} disabled={submitting} type="submit">
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.links}>
          <Link className={styles.link} href="/login">
            Go to Login →
          </Link>
          <Link className={styles.link} href="/">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
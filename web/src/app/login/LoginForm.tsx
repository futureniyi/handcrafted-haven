"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth-form.module.css";
import { useSession } from "../SessionProvider";

type LoginResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error || "Login failed");
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
        `Login successful. Redirecting to ${
          data.user.role === "seller" ? "your dashboard" : "the catalog"
        }...`,
      );
      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to log in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.intro}>
          Sign in to continue browsing products, leaving reviews, or managing your
          seller account.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button className={styles.button} disabled={submitting} type="submit">
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.links}>
          <Link className={styles.link} href="/register">
            Go to Register →
          </Link>
          <Link className={styles.link} href="/">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

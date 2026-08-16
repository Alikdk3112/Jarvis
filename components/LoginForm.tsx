"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel w-full max-w-sm p-8">
      <h1 className="mb-1 text-lg font-semibold text-ink-4">Personal OS</h1>
      <p className="mb-6 text-sm text-ink-3">Enter the dashboard password.</p>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mono w-full rounded-lg border border-ink-2 bg-ink-1 px-3 py-2 text-ink-4 outline-none focus:border-accent"
        placeholder="••••••••"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="mt-4 w-full rounded-lg bg-accent-dim px-3 py-2 text-sm font-medium text-accent transition disabled:opacity-50"
      >
        {busy ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

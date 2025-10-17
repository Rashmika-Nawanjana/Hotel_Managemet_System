"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Verification email sent! Please check your inbox.");
      } else {
        setError(data.error || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Resend Verification Email</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Resend Email"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
}

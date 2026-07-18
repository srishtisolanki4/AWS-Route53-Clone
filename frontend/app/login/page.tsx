"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@route53.local");
  const [password, setPassword] = useState("admin123");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        "route53_token",
        response.data.access_token
      );

      localStorage.setItem(
        "route53_user",
        JSON.stringify(response.data.user)
      );

      router.push("/hosted-zones");
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f3f3] flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-[#d5dbdb] shadow-sm">
        <div className="bg-[#232f3e] px-8 py-6">
          <h1 className="text-2xl font-semibold text-white">
            AWS Route 53
          </h1>

          <p className="text-sm text-gray-300 mt-1">
            Sign in to the Route 53 console
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8"
        >
          <h2 className="text-xl font-medium text-[#161e2d] mb-6">
            Sign in
          </h2>

          {error && (
            <div className="mb-4 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-2">
            Email
          </label>

          <input
            type="text"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full border border-[#879596] px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
          />

          <label className="block text-sm font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="w-full border border-[#879596] px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#0972ce]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-[#161e2d] font-semibold py-2.5 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Demo credentials are pre-filled for this assignment.
          </p>
        </form>
      </div>
    </main>
  );
}
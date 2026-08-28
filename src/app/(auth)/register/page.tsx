"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up any sensitive query params if user previously submitted via standard GET
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);

      const result = await registerAction(formData);

      if (!result.success) {
        setError(result.error || "Registration failed");
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-950 font-bold text-xl shadow-lg">
            d
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create DOTO Account
          </h1>
          <p className="text-xs text-zinc-400">
            Start structuring your projects, roadmaps, and sessions.
          </p>
        </div>

        <form method="POST" onSubmit={handleSubmit} className="space-y-4" action="#">
          {error && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-300">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Your Name</label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Email</label>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Password</label>
            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            variant="default"
            size="md"
            isLoading={isLoading}
            className="w-full text-xs font-semibold"
          >
            <span>Create Account</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-300 hover:text-white hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

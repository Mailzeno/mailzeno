"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { SignupSchema } from "@/lib/validators/auth";
import type { SignupInput } from "@/lib/validators/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { toast } = useToast();

  // ✅ GitHub OAuth (same as login)
  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/signup?redirect=${encodeURIComponent(
          redirectTo
        )}`,
      },
    });
  }

  // ✅ SAME LISTENER FLOW AS LOGIN
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectTo, router, supabase]);

  // ✅ Email Signup
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data: SignupInput = { email, password };
      SignupSchema.parse(data);

      setIsLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Account created 🎉",
        description: "If email verification is required, check your inbox.",
      });

      // ❌ No router.push here
      // Listener handle karega session aate hi

    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Signup failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <main className="relative min-h-screen bg-background">
      <section className="flex min-h-screen flex-col shadow-xl px-10 py-3">
        <Link href={"/"} className="flex items-center gap-1 mb-12">
          <img src="/logo.svg" alt="Mailzeno Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold">mailzeno</span>
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="mb-2 font-semibold text-2xl">Get started</h1>

          <p className="mb-6 text-sm text-muted-foreground">
            Create a new account
          </p>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={signInWithGithub}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.87 3.16 9 7.55 10.46.55.1.75-.24.75-.53v-1.85c-3.07.67-3.72-1.48-3.72-1.48-.5-1.26-1.23-1.6-1.23-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.12 1.68 1.12.98 1.68 2.58 1.2 3.2.92.1-.7.38-1.2.68-1.47-2.45-.28-5.02-1.22-5.02-5.42 0-1.2.43-2.17 1.12-2.93-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.01 1.12.88-.24 1.82-.36 2.75-.36.93 0 1.87.12 2.75.36 2.09-1.42 3.01-1.12 3.01-1.12.6 1.52.22 2.64.11 2.92.7.76 1.12 1.73 1.12 2.93 0 4.21-2.58 5.13-5.04 5.41.39.33.73.98.73 1.98v2.94c0 .29.2.64.76.53 4.38-1.46 7.54-5.59 7.54-10.46C23.01 5.24 18.27.5 12 .5Z" />
            </svg>
            Continue with GitHub
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="main"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to Mailzeno's{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

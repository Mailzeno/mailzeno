"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!email) throw new Error("Please enter your email address");

      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset/update-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Top-left logo and name */}
      <Link href={"/"} className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/logo.svg" alt="Mailzeno Logo" className="h-10 w-10" />
        <span className="text-2xl font-bold">mailzeno</span>
      </Link>

      {/* Form */}
      <div className="w-full max-w-md p-8 md:p-0 ">
        {!isSubmitted ? (
          <>
            <h1 className="text-2xl text-start font-semibold mb-2 text-center">
              Forgot your password?
            </h1>
            <p className="text-sm text-start text-muted-foreground mb-6 text-center">
              Enter your email and we'll send you a link to reset the password
            </p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1">
                <Label className="mb-4" htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-border my-6" />

              <Button type="submit" variant={"main"} className="w-full rounded-md" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              The link will expire in 24 hours. If you don't receive an email, check your spam folder.
            </p>

            <Button
              onClick={() => setIsSubmitted(false)}
              variant="main"
              className="w-full"
            >
              Try another email
            </Button>

            <Link
              href="/login"
              className="inline-flex justify-center w-full mt-2 text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

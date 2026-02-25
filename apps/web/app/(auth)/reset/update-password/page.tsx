"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Detect recovery session properly
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        router.replace("/login");
        setIsValidSession(false);
      } else {
        setIsValidSession(true);
      }
    };

    checkRecoverySession();
  }, [supabase, router, toast]);

  if (isValidSession === null) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </main>
  );
}

  if (!isValidSession) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (!password) throw new Error("Please enter a new password");
      if (!confirmPassword) throw new Error("Please confirm your password");
      if (password !== confirmPassword) throw new Error("Passwords do not match");
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters long");

      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setIsUpdated(true);

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center">
      <Link href={"/"} className="absolute top-6 left-6 flex items-center gap-2">
        <img src="/logo.svg" alt="Mailzeno Logo" className="h-10 w-10" />
        <span className="text-2xl font-bold">mailzeno</span>
      </Link>

      <div className="w-full max-w-sm">
        {!isUpdated ? (
          <>
            <h1 className="text-2xl text-start font-semibold mb-2 text-center">
              Create new password
            </h1>
            <p className="text-sm text-start text-muted-foreground mb-6 text-center">
              Enter a new password for your account.
            </p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button variant={"main"} type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground underline"
              >
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold">Password Updated</h2>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>

            <Button
              onClick={() => router.replace("/login")}
              variant="main"
              className="w-full"
            >
              Go to login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

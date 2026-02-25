"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { Github , ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { DocsMegaMenu } from "./DocsMegaMenu";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);
  const { theme, setTheme } = useTheme();
  const [userInfo, setUserInfo] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        setUserInfo({
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
        });
      }
    };

    getUser();

    // Real-time auth update
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur md:border-b ">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 ">
        {/* Logo */}
        <Link href="/" className="flex items-center text-2xl font-bold">
          <img src="/logo.svg" alt="Logo" className="h-12" />
          mailzeno
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-md text-foreground">
          <DocsMegaMenu />

          <Link
            href="/pricing"
            className="hover:text-foreground hover:bg-muted rounded-full px-2 py-1"
          >
            Pricing
          </Link>

          <Link
            href="https://github.com"
            className="flex items-center gap-1 hover:text-foreground hover:bg-muted rounded-full px-2 py-1"
          >
            <Github className="h-4 w-4" /> GitHub
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 relative">
          {!user ? (
            <>
              <Button className="rounded-full border border-border" asChild>
                <Link href="/login">Sign in</Link>
              </Button>

              <Button
                className="rounded-full bg-primary text-secondary-foreground border border-btn-border hover:scale-105"
                variant="main"
                asChild
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                className="rounded-full border-btn-border bg-primary text-secondary-foreground"
                variant="outline"
                asChild
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              {/* Dropdown */}
              <UserDropdown
                open={open}
                setOpen={setOpen}
                openTheme={openTheme}
                setOpenTheme={setOpenTheme}
                userInfo={userInfo}
                theme={theme}
                setTheme={setTheme}
                logout={logout}
              />
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-9 w-9 flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-foreground transition-all ${
              mobileOpen && "rotate-45"
            }`}
          />
          <span
            className={`h-0.5 w-3 bg-foreground transition-all ${
              mobileOpen ? "-rotate-45 w-5 -translate-y-2" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b bg-background shadow-md rounded-xl">
          <div className="flex flex-col px-6 py-4 gap-3 font-semibold  text-xl">
            <Link href="/docs">Docs</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="https://github.com/mailzeno" className="flex items-center gap-1">
              <Github className="h-4 w-4" /> GitHub
            </Link>

            <div className="border-t pt-3" />

            {!user ? (
              <>
                <Link
                  className="bg-foreground text-white dark:text-black rounded-md px-4 py-2 text-center"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="bg-primary text-secondary-foreground border border-btn-border rounded-md px-4 py-2 text-center"
                  href="/signup"
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/dashboard/settings">Account</Link>
                <button onClick={logout} className="text-left text-red-600">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

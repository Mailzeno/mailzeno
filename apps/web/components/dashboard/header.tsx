"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { FeedbackDropdown } from "./Feedbackform";
import { UserDropdown } from "./UserDropdown";

type UserInfo = {
  name?: string;
  email?: string;
  avatar_url?: string;
};

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  const searchInputRef = useRef<HTMLInputElement>(null);
  const feedbackInputRef = useRef<HTMLTextAreaElement>(null);

  /* shortcut */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* Fetch User */
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserInfo({
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url,
        });
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 border-b z-50 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LEFT */}
        <Link href="/" className="flex items-center text-2xl font-bold">
          <img src="/logo.svg" alt="Logo" className="h-12" />
          mailzeno 
        </Link>

        {/* RIGHT */}
        <div className="gap-5 justify-between inline-flex">
          <div className="hidden md:block">
            <FeedbackDropdown
              className="hidden md:block"
              feedbackOpen={feedbackOpen}
              setFeedbackOpen={setFeedbackOpen}
              feedback={feedback}
              setFeedback={setFeedback}
              feedbackInputRef={feedbackInputRef}
            />
          </div>

          <div className="hidden md:block">
            <SearchBar
              searchInputRef={searchInputRef}
              className="hidden md:block"
            />
          </div>

          
          <UserDropdown
            open={open}
            setOpen={setOpen}
            openTheme={openTheme}
            setOpenTheme={setOpenTheme}
            userInfo={userInfo}
            theme={theme}
            setTheme={setTheme}
            logout={logout}
            className="hidden md:block"
          />

          {/* Mobile Menu Button */}
          
            <button
              onClick={onMenuClick}
              className="md:hidden flex h-9 w-9 flex-col items-center justify-center gap-1.5"
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-foreground transition-all `}
              />
              <span
                className={`h-0.5 w-3 rounded-full translate-x-1 bg-foreground transition-all `}
              />
            </button>
          
        </div>
      </div>
    </header>
  );
}

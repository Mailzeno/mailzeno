"use client";

import {
  Settings,
  GitBranch,
  Sun,
  Moon,
  LogOut,
  CheckCheck,
  PcCaseIcon,
  User,
} from "lucide-react";
import { MenuItem } from "./MenuItem";
import {useRouter} from "next/navigation";
import { useEffect, useRef } from "react";

export function UserDropdown({
  open,
  setOpen,
  openTheme,
  setOpenTheme,
  userInfo,
  theme,
  setTheme,
  logout,
}: any) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter()
  const avatarUrl =
    userInfo?.avatar_url ||
    userInfo?.user_metadata?.avatar_url ||
    null;

  /* close handler */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setOpenTheme(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen, setOpenTheme]);

  const handleSettings = () => {
  setOpen(false)
  router.push('/dashboard/settings')
}


  return (
    <div ref={dropdownRef} className="relative md:pr-16 ">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full border overflow-hidden bg-muted"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="absolute right-1 md:right-16 mt-3 w-50 rounded-lg border bg-card shadow-sm">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">
              {userInfo?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {userInfo?.email || ""}
            </p>
          </div>

          <MenuItem
            className="hover:bg-muted cursor-pointer"
            icon={Settings}
            text="Account preferences"
             action={handleSettings}
          />

          <MenuItem
            className="hover:bg-muted cursor-pointer"
            icon={GitBranch}
            text="Feature previews"
          />

          {/* Theme Hover Wrapper */}
          <div
            className="relative"
            onMouseEnter={() => setOpenTheme(true)}
            onMouseLeave={() => setOpenTheme(false)}
          >
            <MenuItem
              className="hover:bg-muted cursor-pointer"
              icon={PcCaseIcon}
              text="Theme"
            />

            {openTheme && (
              <div className="ml-6 mb-1 mt-1 max-w-40 space-y-1">
                <MenuItem
                  className="hover:bg-muted cursor-pointer rounded-md"
                  icon={Sun}
                  text="Light"
                  action={() => setTheme("light")}
                  endIcon={
                    theme === "light" && (
                      <CheckCheck className="text-primary h-4 w-4" />
                    )
                  }
                />

                <MenuItem
                  className="hover:bg-muted cursor-pointer rounded-md"
                  icon={Moon}
                  text="Dark"
                  action={() => setTheme("dark")}
                  endIcon={
                    theme === "dark" && (
                      <CheckCheck className="text-primary h-4 w-4" />
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="border-t" />

          <MenuItem
            className="hover:bg-muted cursor-pointer"
            icon={LogOut}
            text="Logout"
            danger
            action={logout}
          />
        </div>
      )}
    </div>
  );
}

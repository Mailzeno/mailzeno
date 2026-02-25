"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="relative flex items-center rounded-full border bg-card p-1 w-[64px] h-[32px]">
      
      {/* Animated sliding indicator */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 bottom-1 w-[28px] rounded-full bg-primary border border-btn-border"
        style={{
          left: isDark ? 30 : 4,
        }}
      />

      {/* Light button */}
      <button
        onClick={() => setTheme("light")}
        className="relative z-10 flex h-7 w-7 items-center justify-center"
      >
        <Sun
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-200",
            !isDark
              ? "text-secondry-foreground"
              : "text-muted-foreground"
          )}
        />
      </button>

      {/* Dark button */}
      <button
        onClick={() => setTheme("dark")}
        className="relative z-10 flex h-7 w-7 items-center justify-center"
      >
        <Moon
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-200",
            isDark
              ? "text-secondry-foreground"
              : "text-muted-foreground"
          )}
        />
      </button>
    </div>
  )
}

"use client"

import { useTheme } from "next-themes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      value: "dark",
      label: "Dark",
      preview: "/themes/dark-preview.svg",
    },
    {
      value: "light",
      label: "Light",
      preview: "/themes/light-preview.svg",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {themes.map((t) => {
            const isActive = theme === t.value

            return (
              <div
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground hover:bg-muted"
                }`}
              >
                {/* Preview Image */}
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={t.preview}
                    alt={t.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Label + Radio */}
                <div className="flex items-center gap-3 mt-4">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isActive ? "border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  <span className="text-sm font-medium">{t.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiNextdotjs,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiSvelte,
  SiNuxtdotjs,
  SiRemix,
  SiAstro,
  SiVuedotjs,
} from "react-icons/si";

const frameworks = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "React", icon: SiReact },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Express", icon: SiExpress },
  { name: "SvelteKit", icon: SiSvelte },
  { name: "Nuxt", icon: SiNuxtdotjs },
  { name: "Remix", icon: SiRemix },
  { name: "Astro", icon: SiAstro },
  { name: "Vue", icon: SiVuedotjs },
];

export function FrameworkSupport() {
  const [active, setActive] = useState<string>("any framework");

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">
          <span className="block text-muted-foreground">Use Mailzeno with</span>

          {/* Animated Line */}
          <span className="relative block mt-2  text-md overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                className="inline-block text-secondary-foreground text-3xl"
              >
                {active}
              </motion.span>
            </AnimatePresence>
          </span>
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {frameworks.map((fw) => {
            const Icon = fw.icon;
            const isActive = active === fw.name;
            const isDefault = active === "any framework";

            return (
              <button
                key={fw.name}
                onMouseEnter={() => setActive(fw.name)}
                onMouseLeave={() => setActive("any framework")}
                className={`
          h-14 w-14 sm:h-16 sm:w-16
          flex items-center justify-center
          rounded-md
          border transition-all duration-200
          ${
            isDefault
              ? "text-foreground/70 border-transparent"
              : isActive
                ? "text-foreground border border-btn-border shadow-xs"
                : "text-muted-foreground/50 border-transparent"
          }
        `}
              >
                <Icon className="h-10 w-10" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

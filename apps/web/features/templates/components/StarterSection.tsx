"use client";

import { useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TEMPLATE_CATEGORIES } from "@/config/templateCategories";
import { Template } from "@/types/template";
import { starterTemplates } from "@/lib/templates/starter-templates";
import { StarterCard } from "./StarterCard";

interface Props {
  search: string;
  onDuplicate: (id: string) => void;
  onPreview: (template: Template) => void;
}

export function StarterSection({ search, onDuplicate, onPreview }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const startX = useRef<number | null>(null);

  const filteredStarter = useMemo(() => {
    return starterTemplates.filter((t: Template) => {
      const matchesSearch = `${t.name} ${t.subject}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const totalSlides = Math.ceil(filteredStarter.length / 3);

  /* ---------------- SWIPE LOGIC ---------------- */

  function handleStart(clientX: number) {
    startX.current = clientX;
  }

  function handleEnd(clientX: number) {
    if (startX.current === null) return;

    const diff = startX.current - clientX;

    if (diff > 50 && currentIndex < totalSlides - 1) {
      setCurrentIndex((prev) => prev + 1);
    }

    if (diff < -50 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    startX.current = null;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">mailzeno Starter Templates</h2>
        <p className="text-sm text-muted-foreground">
          Professionally designed templates maintained by mailzeno
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${
              activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "hover:bg-muted"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {filteredStarter.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matching templates.</p>
      ) : (
        <div
          className="relative overflow-hidden"
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseUp={(e) => handleEnd(e.clientX)}
        >
          {/* RIGHT FADE */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10" />

          {/* LEFT FADE */}
          {currentIndex > 0 && (
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent z-10" />
          )}

          {/* LEFT ARROW */}
          {currentIndex > 0 && (
            <button
              type="button"
              aria-label="Previous templates"
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background border shadow rounded-full p-3 sm:p-2 hover:bg-muted transition"
            >
              <ChevronLeft />
            </button>
          )}

          {/* RIGHT ARROW */}
          {currentIndex < totalSlides - 1 && (
            <button
              type="button"
              aria-label="Next templates"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background border shadow rounded-full p-3 sm:p-2 hover:bg-muted transition"
            >
              <ChevronRight />
            </button>
          )}

          {/* SLIDE TRACK */}
          <div
            className="flex gap-6"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 0.4s ease",
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredStarter
                  .slice(slideIndex * 3, slideIndex * 3 + 3)
                  .map((template) => (
                    <StarterCard
                      key={template.id}
                      template={template}
                      onDuplicate={onDuplicate}
                      onPreview={onPreview}
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* DOTS */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? "w-6 bg-primary" : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

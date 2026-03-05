"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const main = document.querySelector(".prose");
    if (!main) return;

    const collect = () => {
      const elements = Array.from(
        main.querySelectorAll("h2, h3")
      ) as HTMLElement[];

      const items = elements
        .filter((el) => el.id)
        .map((el) => ({
          id: el.id,
          text: el.innerText,
          level: el.tagName === "H2" ? 2 : 3,
        }));

      setHeadings(items);

      return elements;
    };

    const elements = collect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    const mutationObserver = new MutationObserver(() => {
      const newElements = collect();
      observer.disconnect();
      newElements.forEach((el) => observer.observe(el));
    });

    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  if (!headings.length) return null;

  return (
    <nav className="hidden lg:block w-56  sticky top-24 text-sm">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        On this page
      </div>

      <ul className="space-y-1 border-l border-border-primary">
        {headings.map((h) => {
          const isActive = activeId === h.id;

          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`
                  block py-1 transition-all duration-200
                  ${
                    h.level === 3
                      ? "pl-6 text-xs"
                      : "pl-4 text-sm"
                  }
                  ${
                    isActive
                      ? "text-accent-secondary border-l-2 border-accent-primary -ml-[1px] bg-accent-muted/40"
                      : "text-text-tertiary hover:text-text-primary"
                  }
                `}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 pt-4 border-t border-border-primary">
        <Link
          href="https://mailzeno.dev"
          className="inline-flex items-center px-3 py-2 text-xs bg-bg-secondary rounded-full font-medium text-accent-secondary hover:text-accent-primary transition-colors"
        >
          Go to main app
        </Link>
      </div>
    </nav>
  );
}
"use client";

import { SMTP_PROVIDERS } from "../config/providers";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export default function ProviderSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Choose Provider</p>

      {/* Mobile: horizontal scroll | Desktop: vertical */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2">
        {SMTP_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelect(provider.id)}
            className={`min-w-[160px] lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition ${
              selected === provider.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            }`}
          >
            <img
              src={provider.logo}
              alt={provider.label}
              className="w-5 h-5"
            />
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}

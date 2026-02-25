

"use client";

interface Props {
  versions: string[];
}

export function ChangelogTimeline({ versions }: Props) {
  return (
    <div className="mt-8">
      {versions.map((version, idx) => (
        <div
          key={version}
          className={`relative pl-8 ${
            idx < versions.length - 1
              ? "pb-10 border-l border-border-primary"
              : ""
          }`}
        >
          <div
            className={`absolute -left-[5px] top-[0.3rem] w-[9px] h-[9px] rounded-full border-2 border-bg-primary ${
              idx === 0 ? "bg-accent-primary" : "bg-border-secondary"
            }`}
          />

          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-text-heading !m-0 !p-0 !border-none">
              v{version}
            </h2>

            {idx === 0 && (
              <span className="text-[0.65rem] font-semibold py-[0.15em] px-[0.5em] rounded-full bg-accent-muted text-accent-secondary border border-border-accent font-mono">
                Latest
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
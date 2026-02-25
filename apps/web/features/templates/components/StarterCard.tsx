import Link from "next/link";
import { Template } from "@/types/template";

interface Props {
  template: Template;
  onDuplicate: (id: string) => void;
  onPreview: (template: Template) => void;
}

export function StarterCard({ template, onDuplicate, onPreview }: Props) {
  return (
    <div
      onClick={() => onPreview(template)}
      className="cursor-pointer border rounded-xl p-4 sm:p-5 bg-card hover:shadow-md transition relative flex flex-col justify-between"
    >
      <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-btn-border/20">
        Starter
      </span>

      <div>
        <h3 className="font-semibold text-sm">{template.name}</h3>

        <p className="text-sm font-medium mt-3 truncate">
          {template.subject}
        </p>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
          {template.body.replace(/<[^>]+>/g, "")}
        </p>
      </div>

      <div className="flex gap-2 mt-5">
        <Link
          href={`/dashboard/send/${template.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center bg-primary text-secondary-foreground text-sm py-2 border border-btn-border rounded-md hover:bg-primary/90 transition"
        >
          Use
        </Link>

        <Link
          href={`/dashboard/templates/new?starter=${template.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center border text-sm py-2 rounded-md hover:bg-muted transition"
        >
          Duplicate
        </Link>
      </div>
    </div>
  );
}

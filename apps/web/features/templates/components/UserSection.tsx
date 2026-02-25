"use client";

import { Template } from "@/types/template";
import { UserTemplateCard } from "./UserTemplateCard";
import { EmptyState } from "./EmptyState";

interface Props {
  templates: Template[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function UserSection({
  templates,
  loading,
  onDelete,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Your Templates</h2>
        <p className="text-sm text-muted-foreground">
          Templates you have created
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">
          Loading templates...
        </p>
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <UserTemplateCard
              key={template.id}
              template={template}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

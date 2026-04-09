"use client";

import { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FieldOptionsEditorProps = {
  options: string[];
  onChange: (options: string[]) => void;
};

function normalizeOptions(options: string[]) {
  return options.map((option) => option.trimStart());
}

export function FieldOptionsEditor({
  options,
  onChange,
}: FieldOptionsEditorProps) {
  const nextOptions = options.length > 0 ? options : ["Option 1", "Option 2"];
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function updateOption(index: number, value: string) {
    const updated = [...nextOptions];
    updated[index] = value;
    onChange(normalizeOptions(updated));
  }

  function addOption() {
    onChange([...nextOptions, `Option ${nextOptions.length + 1}`]);
  }

  function removeOption(index: number) {
    if (nextOptions.length <= 2) return;
    onChange(nextOptions.filter((_, currentIndex) => currentIndex !== index));
  }

  function reorderOptions(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) return;

    const updated = [...nextOptions];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground">Options</p>

      <div className="space-y-2">
        {nextOptions.map((option, index) => (
          <div
            key={`option-${index}`}
            className="flex items-center gap-2"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingIndex === null) return;
              reorderOptions(draggingIndex, index);
              setDraggingIndex(null);
            }}
          >
            <button
              type="button"
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragEnd={() => setDraggingIndex(null)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted"
              aria-label={`Reorder option ${index + 1}`}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <input
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeOption(index)}
              disabled={nextOptions.length <= 2}
              className="shrink-0"
              aria-label={`Remove option ${index + 1}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="mt-1"
      >
        <Plus className="h-4 w-4" />
        Add Option
      </Button>
    </div>
  );
}

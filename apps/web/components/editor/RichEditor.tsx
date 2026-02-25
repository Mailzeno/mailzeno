"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { EditorContent, useEditor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Editor from "@monaco-editor/react";
import DOMPurify from "dompurify";
import {
  Bold,
  Italic,
  AlertTriangle,
  Strikethrough,
  Code as CodeInline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Link2,
  Unlink,
  Code,
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: number;
  readOnly?: boolean;
  showToolbar?: boolean;
  autoFocus?: boolean;
  autoSaveDelay?: number; // ms
}

export default function RichEditor({
  value,
  onChange,
  minHeight = 350,
  readOnly = false,
  showToolbar = true,
  autoFocus = false,
  autoSaveDelay,
}: RichEditorProps) {
  const { theme } = useTheme();
  const [htmlMode, setHtmlMode] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [dirty, setDirty] = useState(false);
  const [showModeWarning, setShowModeWarning] = useState(false);

  /* ---------- Email-safe Sanitizer ---------- */

  const sanitize = (html: string) => {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });
  };

  /* ---------- Editor Setup ---------- */

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 underline hover:text-blue-700 transition-colors",
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const clean = sanitize(editor.getHTML());
      setDirty(true);
      onChange(clean);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none px-4 py-4 focus:outline-none " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
      },
      handleDOMEvents: {
        drop: (view, event) => {
          event.preventDefault();
          return true;
        },
      },
    },
  });

  /* ---------- Auto Focus ---------- */

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  }, [editor, autoFocus]);

  /* ---------- Sync External Value ---------- */

  useEffect(() => {
    if (!editor || htmlMode) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value);
      setDirty(false);
    }
  }, [value, editor, htmlMode]);

  //   RiskyStyles

  const hasRiskyStyles = (html: string) => {
    const riskyPatterns = [
      /style=/i,
      /class=/i,
      /<div/i,
      /<table/i,
      /<span/i,
      /<font/i,
    ];

    return riskyPatterns.some((pattern) => pattern.test(html));
  };

  const handleToggleMode = () => {
    if (htmlMode) {
      // HTML → Visual
      if (hasRiskyStyles(value)) {
        setShowModeWarning(true);
        return;
      }
    }

    setHtmlMode((p) => !p);
  };

  /* ---------- Auto Save ---------- */

  useEffect(() => {
    if (!autoSaveDelay || !dirty) return;

    const timer = setTimeout(() => {
      setDirty(false);
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [dirty, autoSaveDelay]);

  /* ---------- Link Handling ---------- */

  const applyLink = () => {
    if (!editor || !linkUrl) return;

    try {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      new URL(url);

      editor.chain().focus().setLink({ href: url }).run();
      setLinkOpen(false);
      setLinkUrl("");
    } catch {
      return;
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="w-full relative">
      {/* Dirty indicator */}
      {dirty && (
        <div className="absolute right-3 top-2 text-xs text-muted-foreground">
          Editing...
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && showToolbar && (
        <div className="flex items-center justify-between border-b p-2 bg-muted/30">
          {/* LEFT SIDE - Formatting (Only Visual Mode) */}
          {!htmlMode && (
            <div className="flex flex-wrap gap-1">
              <TB
                onClick={() => editor.chain().focus().undo().run()}
                icon={<Undo size={14} />}
                disabled={!editor.can().undo()}
              />
              <TB
                onClick={() => editor.chain().focus().redo().run()}
                icon={<Redo size={14} />}
                disabled={!editor.can().redo()}
              />

              <Divider />

              <TB
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                icon={<Heading1 size={14} />}
                active={editor.isActive("heading", { level: 1 })}
              />
              <TB
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                icon={<Heading2 size={14} />}
                active={editor.isActive("heading", { level: 2 })}
              />

              <Divider />

              <TB
                onClick={() => editor.chain().focus().toggleBold().run()}
                icon={<Bold size={14} />}
                active={editor.isActive("bold")}
              />
              <TB
                onClick={() => editor.chain().focus().toggleItalic().run()}
                icon={<Italic size={14} />}
                active={editor.isActive("italic")}
              />
              <TB
                onClick={() => editor.chain().focus().toggleStrike().run()}
                icon={<Strikethrough size={14} />}
                active={editor.isActive("strike")}
              />
              <TB
                onClick={() => editor.chain().focus().toggleCode().run()}
                icon={<CodeInline size={14} />}
                active={editor.isActive("code")}
              />

              <Divider />

              <TB
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                icon={<List size={14} />}
                active={editor.isActive("bulletList")}
              />
              <TB
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                icon={<ListOrdered size={14} />}
                active={editor.isActive("orderedList")}
              />

              <Divider />

              <TB
                onClick={() => setLinkOpen(true)}
                icon={<Link2 size={14} />}
                active={editor.isActive("link")}
              />

              {editor.isActive("link") && (
                <TB onClick={removeLink} icon={<Unlink size={14} />} />
              )}
            </div>
          )}

          {/* RIGHT SIDE - ALWAYS VISIBLE */}
          <div>
            <TB
              onClick={handleToggleMode}
              icon={<Code size={14} />}
              active={htmlMode}
            >
              {htmlMode ? "Visual" : "HTML"}
            </TB>
          </div>
        </div>
      )}

      {/* Editor Area */}
      {htmlMode ? (
        <Editor
          height={`${minHeight + 150}px`}
          defaultLanguage="html"
          theme={theme === "dark" ? "vs-dark" : "vs"}
          value={value}
          onChange={(v) => onChange(v || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      ) : (
        <div style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Link Modal */}
      {linkOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border shadow-2xl">
            <h3 className="text-base font-semibold mb-4">Insert Link</h3>

            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
                if (e.key === "Escape") setLinkOpen(false);
              }}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setLinkOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted transition"
              >
                Cancel
              </button>

              <button
                onClick={applyLink}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {showModeWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModeWarning(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[92%] sm:max-w-sm p-0 overflow-hidden rounded-lg bg-card border shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b">
              <h2 className="text-base font-semibold">
                Switch to Editor Mode?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Some advanced HTML formatting may be lost.
              </p>
            </div>

            {/* Body */}
            <div className="flex gap-3 px-5 py-3 bg-red-500/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500/30">
            <AlertTriangle className="h-5 w-5 text-secondry-foreground" />
          </div>

          <p className="text-sm text-secondry-foreground leading-relaxed">
            Editor mode does not fully support inline styles, tables or
            custom classes. Switching may simplify your HTML structure.
          </p>
        </div>

            {/* Footer */}
            <div className="flex border-t gap-3 px-6 py-5">
              <Button
                variant={"outline"}
                onClick={() => setShowModeWarning(false)}
                className="flex-1 px-4 py-2 border rounded-md transition"
              >
                Stay in HTML
              </Button>

              <Button
                variant={"destructive"}
                onClick={() => {
                  setHtmlMode(false);
                  setShowModeWarning(false);
                }}
                className="flex-1 px-4 py-2 rounded-md transition"
              >
                Switch Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

function TB({
  icon,
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  children?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md flex gap-2 border transition ${
        active
          ? "bg-primary text-secondry-foreground border border-btn-border"
          : disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted"
      }`}
    >
      {icon}
      {children && <span className="text-xs">{children}</span>}
    </button>
  );
}

function Divider() {
  return <div className="w-px bg-border mx-1" />;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import AIGenerateModal from "./AIGenerateModal";
import Editor from "@monaco-editor/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";

type Props = {
  body: string;
  setBody: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  error?: string;
  onPreview: () => void;
  htmlMode: boolean;
  onToggleMode: () => void;
  onChooseTemplate: () => void;
};

export default function MessageEditor({
  body,
  setBody,
  subject,
  setSubject,
  error,
  onPreview,
  htmlMode,
  onChooseTemplate,
  onToggleMode,
}: Props) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  // Ai states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Link insert modal functions
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing your email message...",
      }),
    ],
    content: body,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (!htmlMode && editor && body !== editor.getHTML()) {
      editor.commands.setContent(body);
    }
  }, [htmlMode, editor, body]);

  const formatHtml = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleBulletList = () =>
    editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor?.chain().focus().toggleOrderedList().run();
  const clearFormat = () =>
    editor?.chain().focus().clearNodes().unsetAllMarks().run();

  const insertLink = () => {
    if (!linkUrl || !editor) return;
    try {
      new URL(linkUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkOpen(false);
    setLinkUrl("");
  };

  const removeLink = () => editor?.chain().focus().unsetLink().run();

  // Handle AI buttons
  const handleAI = async (
    type: "generate" | "rewrite",
    customPrompt?: string,
  ) => {
    try {
      setAiLoading(true);

      const res = await fetch("/api/ai/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: htmlMode ? "html" : "text",
          type,
          prompt: type === "generate" ? customPrompt : undefined,
          content: type === "rewrite" ? body : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "AI failed");
        return;
      }

      const subject = data?.result?.subject;
      const content = data?.result?.content;

      if (!subject || !content) {
        alert("AI returned empty subject or content");
        return;
      }

      setSubject(subject);

      if (htmlMode) {
        setBody(content);
      } else {
        if (editor) {
          editor.commands.setContent(content);
        }
        setBody(content);
      }

      setAiModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("AI error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 space-y-6 bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="text-sm font-medium">
          Message <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {/* Choose Template */}
          <button
            type="button"
            onClick={onChooseTemplate}
            className="px-3 py-1.5 text-xs rounded-md border hover:bg-muted transition"
          >
            Choose Template
          </button>

          {/* HTML Toggle */}
          <button
            onClick={onToggleMode}
            className={`px-3 py-1.5 text-xs rounded-md border transition ${
              htmlMode
                ? "bg-primary border-btn-border border text-secondry-foregroune"
                : "hover:bg-muted"
            }`}
            type="button"
          >
            {htmlMode ? "Editor Mode" : "HTML </>"}
          </button>

          {htmlMode && (
            <button
              onClick={formatHtml}
              className="px-3 py-1.5 text-xs rounded-md border hover:bg-muted transition"
              type="button"
            >
              Format Code
            </button>
          )}

          <button
            onClick={onPreview}
            className="px-3 py-1.5 text-xs rounded-md flex gap-1 border hover:bg-muted transition"
            type="button"
            disabled={!body || body === "<p></p>"}
          >
            Preview <Eye className="w-4 h-4" />
          </button>

          {htmlMode && (
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              disabled={aiLoading}
              className="px-3 py-1.5 text-xs rounded-md border hover:bg-muted transition"
            >
              {aiLoading ? "Thinking..." : "✦ AI Generate"}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAI("rewrite")}
            disabled={aiLoading || !body}
            className="px-3 py-1.5 text-xs rounded-md border hover:bg-muted transition"
          >
            {aiLoading ? "Thinking..." : "✦ AI Enhance"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!htmlMode && editor && (
        <div className="flex flex-wrap items-center gap-1.5 border rounded-lg p-2 bg-muted/30">
          <ToolbarButton
            icon={<Bold size={16} />}
            isActive={editor.isActive("bold")}
            onClick={toggleBold}
            label="Bold"
          />
          <ToolbarButton
            icon={<Italic size={16} />}
            isActive={editor.isActive("italic")}
            onClick={toggleItalic}
            label="Italic"
          />
          <ToolbarButton
            icon={<UnderlineIcon size={16} />}
            isActive={editor.isActive("underline")}
            onClick={toggleUnderline}
            label="Underline"
          />

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton
            icon={<List size={16} />}
            isActive={editor.isActive("bulletList")}
            onClick={toggleBulletList}
            label="Bullet List"
          />
          <ToolbarButton
            icon={<ListOrdered size={16} />}
            isActive={editor.isActive("orderedList")}
            onClick={toggleOrderedList}
            label="Numbered List"
          />

          <div className="w-px h-6 bg-border mx-1" />

          <ToolbarButton
            icon={<Link2 size={16} />}
            isActive={editor.isActive("link")}
            onClick={() => setLinkOpen(true)}
            label="Insert Link"
          />

          {editor.isActive("link") && (
            <ToolbarButton
              icon={<X size={16} />}
              isActive={false}
              onClick={removeLink}
              label="Remove Link"
              variant="danger"
            />
          )}

          <div className="w-px h-6 bg-border mx-1" />

          <button
            type="button"
            onClick={clearFormat}
            className="px-2.5 py-1.5 text-xs rounded-md border border-border hover:bg-muted/50 text-red-500 hover:text-red-600 transition-all"
          >
            Clear
          </button>
        </div>
      )}

      {/* Editor */}
      {htmlMode ? (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <Editor
            height="420px"
            defaultLanguage="html"
            theme={theme === "dark" ? "vs-dark" : "vs"}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            value={body}
            onChange={(value) => setBody(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        <div
          className={`border rounded-lg overflow-hidden bg-background shadow-sm transition-all ${
            error
              ? "border-red-500 ring-1 ring-red-500/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Link Modal */}
      {linkOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 w-full max-w-md border shadow-2xl"
          >
            <h3 className="text-base font-semibold mb-4">Insert Link</h3>

            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setLinkOpen(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={insertLink}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
              >
                Insert
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* TYPOGRAPHY STYLES */}
      <style jsx global>{`
        .tiptap-content p {
          margin: 0.75rem 0;
          line-height: 1.6;
        }

        .tiptap-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .tiptap-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .tiptap-content li {
          margin: 0.5rem 0;
        }

        .tiptap-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 1.2rem 0 0.8rem;
        }

        .tiptap-content h2 {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 1rem 0 0.6rem;
        }

        .tiptap-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .dark .tiptap-content a {
          color: #60a5fa;
        }
      `}</style>

      <AIGenerateModal
        open={aiModalOpen}
        loading={aiLoading}
        onClose={() => setAiModalOpen(false)}
        onGenerate={async (prompt) => {
          try {
            setAiLoading(true);

            const res = await fetch("/api/ai/email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mode: "html",
                type: "generate",
                prompt,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data.error || "AI failed");
              return;
            }

            const subject = data?.result?.subject;
            const content = data?.result?.content;

            if (!subject || !content) {
              alert("AI returned empty response");
              return;
            }

            setSubject(subject);
            setBody(content);

            setAiModalOpen(false);
          } catch (err) {
            console.error(err);
            alert("AI error");
          } finally {
            setAiLoading(false);
          }
        }}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  isActive,
  onClick,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md border transition-all ${
        isActive
          ? "bg-primary/10 border-primary text-primary shadow-sm"
          : variant === "danger"
            ? "border-border hover:bg-red-50 text-red-500"
            : "border-border hover:bg-muted/50"
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Trash2, SquarePen, AlertTriangle, Copy, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  template: Template;
  onDelete: (id: string) => void;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

//  Copy Button with Feedback

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (copied) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          toast({
            title: "Copied",
            description: `${label} copied to clipboard`,
          });
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        toast({ title: "Copied", description: `${label} copied to clipboard` });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast({ title: "Failed", description: "Could not copy to clipboard" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border transition-all duration-200 ${
        copied
          ? "border-green-500/40 bg-green-500/10 text-green-600"
          : "hover:bg-muted"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Check size={12} />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Copy size={12} />
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// Copy Section inside the Modal

function CopySection({ template }: { template: Template }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Template ID
          </p>
          <CopyButton text={template.id} label="Template ID" />
        </div>
        <div className="bg-muted/50 rounded-md p-3 font-mono text-xs break-all">
          templateId: "{template.id}"
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Template Key
          </p>
          <CopyButton text={template.template_key!} label="Template Key" />
        </div>
        <div className="bg-muted/50 rounded-md p-3 font-mono text-xs break-all">
          templateKey: "{template.template_key}"
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Dialog
function DeleteDialog({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 hover:bg-red-500/20 transition-colors text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[95%] sm:max-w-sm p-0 overflow-hidden rounded-lg">
        <div className="px-5 py-4 border-b">
          <h2 className="text-base font-semibold">Delete Template?</h2>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deleting this template will permanently remove all associated data.
          </p>
        </div>
        <div className="flex border-t gap-3 px-6 py-5">
          <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="flex-1"
            onClick={onDelete}
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function UserTemplateCard({ template, onDelete }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pcModalOpen, setPcModalOpen] = useState(false);

  return (
    <>
       {/*  DeskTop Card  */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setPcModalOpen(true)}
        className="hidden md:flex border rounded-xl p-4 sm:p-5 bg-card hover:shadow-md transition flex-col cursor-pointer"
      >
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-md font-bold break-words line-clamp-2">
            {template.name}
          </h3>
          <div
            className="flex gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/templates/${template.id}/edit`)
              }
              className="flex items-center gap-2 text-xs text-secondary-foreground rounded-md border px-2.5 py-1.5 hover:bg-muted transition-colors"
            >
              <SquarePen className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <DeleteDialog onDelete={() => onDelete(template.id)} />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium truncate">{template.subject}</p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
            {stripHtml(template.body)}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            {template.usage_count || 0} uses
          </div>
        </div>

        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            onClick={() => router.push(`/dashboard/send/${template.id}`)}
            className="w-full bg-primary text-secondary-foreground border border-btn-border text-sm py-2 rounded-md hover:bg-primary/90 transition"
          >
            Use Template
          </Button>
        </div>
      </motion.div>

      {/*  DeskTop Modal */}

      <AnimatePresence>
        {pcModalOpen && (
          <div
            className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setPcModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="bg-card rounded-2xl border shadow-xl p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{template.name}</h2>
                <button
                  type="button"
                  onClick={() => setPcModalOpen(false)}
                  className="p-2 rounded-md hover:bg-muted transition"
                >
                  <X size={16} />
                </button>
              </div>
              <CopySection template={template} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile card */}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setDrawerOpen(true)}
        className="md:hidden border rounded-xl p-4 bg-card hover:shadow-md transition flex flex-col cursor-pointer select-none"
      >
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-md font-bold break-words line-clamp-2 flex-1">
            {template.name}
          </h3>
          {/* stopPropagation */}
          <div
            className="flex gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/templates/${template.id}/edit`)
              }
              className="flex items-center gap-2 text-xs text-secondary-foreground rounded-md border px-2.5 py-1.5 hover:bg-muted transition-colors"
            >
              <SquarePen className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <DeleteDialog onDelete={() => onDelete(template.id)} />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium truncate">{template.subject}</p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
            {stripHtml(template.body)}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            {template.usage_count || 0} uses
          </div>
        </div>

        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            onClick={() => router.push(`/dashboard/send/${template.id}`)}
            className="w-full bg-primary text-secondary-foreground border border-btn-border text-sm py-2 rounded-md hover:bg-primary/90 transition"
          >
            Use Template
          </Button>
        </div>
      </motion.div>

      {/* Mobile Funtions */}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle>{template.name}</DrawerTitle>
            <DrawerDescription>Copy template details</DrawerDescription>
          </DrawerHeader>
          <div className="mt-2">
            <CopySection template={template} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

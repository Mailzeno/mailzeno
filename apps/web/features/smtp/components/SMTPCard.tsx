"use client";

import { motion } from "framer-motion";
import { Power, Trash2, Loader2, Copy, X } from "lucide-react";
import { resolveLogo } from "../utils/providerResolver";
import { SMTPAccount } from "../hooks/useSMTP";
import {Drawer, DrawerContent,DrawerHeader,DrawerTitle,DrawerDescription,} from "@/components/ui/drawer";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,AlertDialogAction,AlertDialogTrigger,} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface Props {
  smtp: SMTPAccount;
  processingId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return name.slice(0, 2) + "***@" + domain;
}

export default function SMTPCard({
  smtp,
  processingId,
  onToggle,
  onDelete,
}: Props) {
  const { toast } = useToast();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [pcModalOpen, setPcModalOpen] = useState(false);

  const isProcessing = processingId === smtp.id;

  // Safe clipboard with fallback
  function copyToClipboard(text: string) {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          toast({ title: "Copied", description: "SMTP ID copied to clipboard" });
        });
      } else {
        // Fallback for mobile browsers that block clipboard API
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast({ title: "Copied", description: "SMTP ID copied to clipboard" });
      }
    } catch {
      toast({ title: "Failed", description: "Could not copy to clipboard" });
    }
  }

  // Shared left-side info block
  const InfoBlock = (
    <div className="flex gap-4">
      <img src={resolveLogo(smtp.host)} alt="provider" className="w-10 h-10" />
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-medium">{smtp.name}</h2>
          {smtp.is_default && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600">
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {smtp.host}:{smtp.port}
        </p>
        <p className="text-sm text-muted-foreground">
          {maskEmail(smtp.from_email)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Added {new Date(smtp.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Pc Modal Trigger */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setPcModalOpen(true)}
        className="hidden md:flex rounded-2xl border bg-card p-6 flex-row items-center justify-between gap-4 hover:shadow-md transition cursor-pointer"
      >
        {InfoBlock}

        {/* Desktop quick actions — stop propagation so card click doesn't fire */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onToggle(smtp.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
              smtp.is_default
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
            {smtp.is_default ? "Default" : "Set Default"}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={isProcessing}
                className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center gap-2 transition"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete SMTP?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This SMTP configuration will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                   variant="destructive"
                  onClick={() => onDelete(smtp.id)}
                  className=""
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      {/* PC Modal */}
      {pcModalOpen && (
        <div
          className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setPcModalOpen(false)}
        >
          <div
            className="bg-card rounded-2xl border shadow-xl p-6 w-full max-w-md space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">{smtp.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {smtp.host}:{smtp.port}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPcModalOpen(false)}
                className="p-2 rounded-md hover:bg-muted transition"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">SMTP ID</p>
              <div className="flex items-center justify-between bg-muted rounded-md p-3">
                <span className="text-xs font-mono break-all">{smtp.id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(smtp.id)}
                  className="p-2 hover:bg-muted/80 rounded-md transition shrink-0 ml-2"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">From Email</p>
              <p className="text-sm">{smtp.from_email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm">
                {new Date(smtp.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  onToggle(smtp.id);
                  setPcModalOpen(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm transition ${
                  smtp.is_default
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Power size={14} />
                )}
                {smtp.is_default ? "Default" : "Set Default"}
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 rounded-md border border-red-200 text-red-600 py-2 text-sm transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete SMTP?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(smtp.id);
                        setPcModalOpen(false);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

     {/* mobile sheet */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setMobileDrawerOpen(true)}
        className="md:hidden rounded-2xl border bg-card p-6 flex flex-col gap-2 hover:shadow-md transition cursor-pointer select-none"
      >
        {InfoBlock}
      </motion.div>

      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle>{smtp.name}</DrawerTitle>
            <DrawerDescription>
              {smtp.host}:{smtp.port}
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 mt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SMTP ID</p>
              <div className="flex items-center justify-between bg-muted rounded-md p-3">
                <span className="text-xs font-mono break-all">{smtp.id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(smtp.id)}
                  className="p-2 hover:bg-muted/80 rounded-md transition shrink-0 ml-2"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">From Email</p>
              <p className="text-sm">{smtp.from_email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm">
                {new Date(smtp.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  onToggle(smtp.id);
                  setMobileDrawerOpen(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm transition ${
                  smtp.is_default
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : smtp.is_default ? (
                  "Default"
                ) : (
                  "Set Default"
                )}
              </button>

              <div className="flex-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="w-full rounded-md border border-red-200 text-red-600 py-2 text-sm transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete SMTP?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDelete(smtp.id);
                          setMobileDrawerOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
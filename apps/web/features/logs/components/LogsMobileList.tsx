"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import PreviewModal from "@/features/send-email/components/PreviewModal";

export function LogsMobileList({ logs }: any) {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      {/* List */}
      <div className="divide-y rounded-2xl border shadow-sm">
        {logs.map((log: any) => (
          <div
            key={log.id}
            className="p-4 space-y-2 cursor-pointer active:bg-muted/40 transition"
            onClick={() => setSelectedLog(log)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium truncate max-w-[200px]">
                {log.to_email}
              </span>
              <StatusBadge status={log.status} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {log.subject || "No subject"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
              onClick={() => setSelectedLog(null)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-background border-t rounded-xl shadow-2xl"
              style={{ maxHeight: "85vh" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
                <h2 className="text-base font-semibold">Email Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-md hover:bg-muted transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 text-sm">
                <Detail label="To" value={selectedLog.to_email} />
                <Detail label="Subject" value={selectedLog.subject} />
                <Detail label="Status" value={selectedLog.status} />
                <Detail
                  label="Sent At"
                  value={new Date(selectedLog.created_at).toLocaleString()}
                />
                {selectedLog.error && (
                  <Detail label="Error" value={selectedLog.error} />
                )}

                {selectedLog.html && (
                  <div>
                    <p className="font-medium mb-2 text-muted-foreground">
                      Preview
                    </p>
                    <div className="relative group border rounded-xl overflow-hidden">
                      <iframe
                        className="w-full h-52 bg-white pointer-events-none"
                        sandbox="allow-same-origin"
                        srcDoc={selectedLog.html}
                      />
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center  transition duration-300">
                        <button
                          onClick={() => setPreviewOpen(true)}
                          className="flex items-center gap-2 bg-primary border border-btn-border text-secondary-foreground px-4 py-2 rounded-md shadow-md hover:scale-105 transition cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Preview Modal */}
      {selectedLog && (
        <PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          form={{
            subject: selectedLog.subject,
            body: selectedLog.html,
          }}
        />
      )}
    </>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-medium break-all">{value ?? "-"}</p>
    </div>
  );
}
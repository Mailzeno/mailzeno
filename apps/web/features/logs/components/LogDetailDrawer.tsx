"use client";

import { X, Eye } from "lucide-react";
import { useState } from "react";
import PreviewModal from "@/features/send-email/components/PreviewModal";

export function LogDetailDrawer({
  log,
  onClose,
}: {
  log: any;
  onClose: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!log) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/10 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <div className="relative ml-auto md:w-[480px] rounded-xl rounded-l bg-background h-full shadow-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Email Details</h2>
            <button className="cursor-pointer hover:bg-primary rounded-md p-1" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <Detail label="To" value={log.to_email} />
            <Detail label="Subject" value={log.subject} />
            <Detail label="Status" value={log.status} />
            <Detail
              label="Sent At"
              value={new Date(log.created_at).toLocaleString()}
            />

            {log.error && <Detail label="Error" value={log.error} />}

            {log.html && (
              <div>
                <p className="font-medium mb-2">Preview</p>

                <div className="relative group border rounded-lg overflow-hidden">
                  {/* Iframe */}
                  <iframe
                    className="w-full h-52 bg-white"
                    sandbox="allow-same-origin"
                    srcDoc={log.html}
                  />

                  {/* Blur Overlay */}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-lg transition duration-300">
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center cursor-pointer gap-2 bg-primary border border-btn-border text-secondary-foreground px-4 py-2 rounded-md shadow-md hover:scale-105 transition"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={{
          subject: log.subject,
          body: log.html,
        }}
      />
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
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium break-all">{value ?? "-"}</p>
    </div>
  );
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X } from "lucide-react"

type Template = {
  id: string
  name: string
  subject: string
  body: string
}

export function TemplateModal({
  open,
  onClose,
  templates,
  onSelect
}: {
  open: boolean
  onClose: () => void
  templates: Template[]
  onSelect: (t: Template) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card w-full max-w-lg rounded-xl border shadow-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium text-sm">Choose Template</h3>
              <button className="hover:bg-primary p-1 rounded-md" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 max-h-80 overflow-y-auto space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    No templates created yet.
                  </p>
                  <Link
                    href="/dashboard/templates"
                    className="inline-flex px-4 py-2 bg-primary text-white rounded-md text-sm"
                  >
                    Create Template
                  </Link>
                </div>
              ) : (
                templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="border rounded-md p-3 hover:bg-primary/20 cursor-pointer transition"
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.subject}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

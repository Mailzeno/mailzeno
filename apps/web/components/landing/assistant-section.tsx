"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MousePointerClick, Zap, Mail, PenLine, BookOpen, ScrollText, BarChart3 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/* ---------------- Sub-blocks ---------------- */

function ChatBlock({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col gap-2 mt-1">
      {[["w-4/5", false], ["w-3/5", true], ["w-2/3", false]].map(([w, isPrimary], i) => (
        <motion.div
          key={i}
          animate={{ opacity: active ? 1 : 0.3, x: active ? 0 : (i % 2 === 0 ? -5 : 5) }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className={`h-2 rounded-full ${isPrimary ? "bg-primary" : "bg-muted"} ${w}`}
        />
      ))}
    </div>
  )
}

function BarsBlock({ active }: { active: boolean }) {
  const targets = ["75%", "50%", "88%"]
  return (
    <div className="flex flex-col gap-2 mt-1">
      {targets.map((target, i) => (
        <div key={i} className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: active ? target : "15%" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
          />
        </div>
      ))}
    </div>
  )
}

/* ---------------- Panels ---------------- */

const PANELS = [
  { label: "Quick start",   Icon: Zap,        block: "bars" },
  { label: "SMTP setup",    Icon: Mail,       block: "chat" },
  { label: "Write with AI", Icon: PenLine,    block: "chat" },
  { label: "API reference", Icon: BookOpen,   block: "bars" },
  { label: "Email logs",    Icon: ScrollText, block: "bars" },
  { label: "Insights",      Icon: BarChart3,  block: "chat" },
]

/* ---------------- SVG Connecting Lines ---------------- */

function ConnectingLines({
  panelRefs,
  step,
  containerRef,
}: {
  panelRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  step: number
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([])

  useEffect(() => {
    const recalc = () => {
      const refs = panelRefs.current
      const container = containerRef.current
      if (!container || !refs.length) return
      const cr = container.getBoundingClientRect()
      const newLines: typeof lines = []
      for (let i = 0; i < refs.length - 1; i++) {
        const a = refs[i]
        const b = refs[i + 1]
        if (!a || !b) continue
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        newLines.push({
          x1: ra.left - cr.left + ra.width / 2,
          y1: ra.top - cr.top + ra.height / 2,
          x2: rb.left - cr.left + rb.width / 2,
          y2: rb.top - cr.top + rb.height / 2,
        })
      }
      setLines(newLines)
    }
    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [panelRefs, containerRef])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker id="dot" viewBox="0 0 4 4" refX="2" refY="2" markerWidth="4" markerHeight="4">
          <circle cx="2" cy="2" r="1.5" fill="hsl(var(--primary))" />
        </marker>
      </defs>
      {lines.map((l, i) => {
        const passed = i < step
        const isCurrent = i === step - 1
        return (
          <g key={i}>
            {/* base line */}
            <line
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.6"
            />
            {/* active fill */}
            {passed && (
              <motion.line
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5 5"
                markerEnd={isCurrent ? "url(#dot)" : undefined}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: isCurrent ? 1 : 0.45, pathLength: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------------- Main ---------------- */

export function AssistantSystem() {
  const [step, setStep] = useState(0)
  const total = PANELS.length
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setStep((s) => (s + 1) % total), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const panel = panelRefs.current[step]
    const container = containerRef.current
    if (!panel || !container) return
    const pr = panel.getBoundingClientRect()
    const cr = container.getBoundingClientRect()
    setCursorPos({
      x: pr.left - cr.left + pr.width / 2 - 18,
      y: pr.top - cr.top + pr.height / 2 - 18,
    })
  }, [step, mounted])

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <div
        ref={containerRef}
        className="relative rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10 overflow-hidden"
      >

        {/* Connecting lines layer */}
        <ConnectingLines panelRefs={panelRefs} step={step} containerRef={containerRef} />

        {/* Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" style={{ zIndex: 1 }}>
          {PANELS.map((panel, i) => {
            const active = step === i
            return (
              <motion.div
                key={i}
                ref={(el) => { panelRefs.current[i] = el }}
                animate={{ opacity: active ? 1 : 0.58, scale: active ? 1.025 : 1 }}
                transition={{ duration: 0.35 }}
                onClick={() => setStep(i)}
                className="relative rounded-xl border-2 border-dashed bg-background p-4 sm:p-5 h-36 sm:h-40 lg:h-48 overflow-hidden cursor-pointer"
                style={{
                  borderColor: active ? "#22ae7d8f" : "",
                  boxShadow: active
                    ? "0 0 28px hsl(var(--primary)/0.14), inset 0 0 18px hsl(var(--primary)/0.05)"
                    : "none",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              >
                

                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                    transition={{ duration: 0.3 }}
                  >
                    <panel.Icon className="h-4 w-4 shrink-0" />
                  </motion.div>
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {panel.label}
                  </span>
                </div>

                {/* inner divs */}
                <div
                  className="rounded-lg border border- p-3"
                >
                  {panel.block === "bars" ? <BarsBlock active={active} /> : <ChatBlock active={active} />}
                </div>

                {/* Shimmer */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key={`shimmer-${step}`}
                      initial={{ x: "-110%", opacity: 0.7 }}
                      animate={{ x: "210%", opacity: 0 }}
                      exit={{}}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Moving cursor — desktop only */}
        {mounted && (
          <motion.div
            animate={{ x: cursorPos.x, y: cursorPos.y }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="absolute pointer-events-none hidden lg:flex items-center justify-end pt-10"
            style={{ zIndex: 10, top: 0, left: 0, width: 36, height: 36 }}
          >
            <motion.span
              key={step}
              initial={{ scale: 0.4, opacity: 0.55 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute h-9 w-9 rounded-full"
              style={{ background: "hsl(var(--primary)/0.22)" }}
            />
            <MousePointerClick
              className="h-9 w-9 text-primary "
              style={{ filter: "drop-shadow(0 0 2px hsl(var(--primary)))" }}
              
            />
          </motion.div>
        )}

        {/* Top radial glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--primary)/0.07), transparent)",
          }}
        />
      </div>
    </section>
  )
}
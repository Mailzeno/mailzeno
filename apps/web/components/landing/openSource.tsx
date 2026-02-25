"use client"

import { Github, Star } from "lucide-react"
import { motion } from "framer-motion"

export function OpenSourceSection() {
  return (
    <section className="relative bg-background py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-semibold tracking-tight"
        >
          Open source from day one
        </motion.h2>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          MailZeno is built in the open. Transparent architecture, auditable
          core, and community-driven development. Fork it, contribute,
          self-host it you’re always in control.
        </motion.p>

        {/* GitHub Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center"
        >
          <a
            href="https://github.com/mailzeno/mailzeno"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-3
              rounded-md border bg-card px-5 py-2
              text-sm font-semibold 
              transition-all duration-200
              hover:border-btn-border hover:bg-muted/30
            "
          > 
            
            <Github className="h-4 w-4 text-foreground" />
            <span>@mailzeno</span> 
          </a>

          <p className="mt-4 text-sm text-muted-foreground">
            {" "} Built in Public •{" "} MIT License • Devloper Friendly.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
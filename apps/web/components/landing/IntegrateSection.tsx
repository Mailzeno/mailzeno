"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { integrations } from "@/lib/integrations";
import { Copy, ClipboardCheck, Zap, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import {useRouter} from "next/navigation";
import {
  SiNodedotjs,
  SiPython,
  SiGo,
  SiVercel,
  SiAmazon,
  SiCloudflare,
} from "react-icons/si";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import * as hljsStyles from "react-syntax-highlighter/dist/esm/styles/hljs";
// @ts-ignore
import * as prismStyles from "react-syntax-highlighter/dist/esm/styles/prism";

const iconMap: Record<string, any> = {
  node: SiNodedotjs,
  python: SiPython,
  go: SiGo,
  serverless: Zap,
};

export function IntegrateSection() {
  const [active, setActive] = useState(integrations[0]);
  const [env, setEnv] = useState(active.code.environments?.[0] ?? null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const currentSnippet =
    active.type === "serverless" ? env?.snippet : active.code.default;

  const language =
    active.id === "python"
      ? "python"
      : active.id === "go"
        ? "go"
        : "javascript";

  const copy = () => {
    if (!currentSnippet) return;
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = iconMap[active.id];

  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Simple Integration Production Ready.
        </h2>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Use our SDKs or deploy serverless Secure, scalable and ready for
          real-world workloads.
        </p>

        {/* Primary Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {integrations.map((item) => {
            const TabIcon = iconMap[item.id];
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item);
                  setEnv(item.code.environments?.[0] ?? null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-all ${
                  active.id === item.id
                    ? "border-btn-border text-secondary-foreground bg-primary/10"
                    : "border-border text-muted-foreground hover:border-muted"
                }`}
              >
                {TabIcon && <TabIcon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Serverless Environment Tabs */}
        {active.type === "serverless" && (
          <div className="mt-6 flex justify-center gap-3">
            {active.code.environments?.map((e) => (
              <button
                key={e.id}
                onClick={() => setEnv(e)}
                className={`flex items-center gap-2 px-3 py-1 font-medium text-sm transition ${
                  env?.id === e.id
                    ? "border-b-2 border-primary transition"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {e.id === "vercel" && <SiVercel className="h-4 w-4" />}
                {e.id === "aws" && <SiAmazon className="h-4 w-4" />}
                {e.id === "cloudflare" && <SiCloudflare className="h-4 w-4" />}
                {e.label}
              </button>
            ))}
          </div>
        )}

        {/* Code Section */}
        <div className="mt-16 flex justify-center px-4">
          <div className="w-full max-w-3xl rounded-2xl border-2 border-dashed  overflow-hidden text-left">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-dashed border-primary bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                {active.label}
              </div>

              <button
                onClick={copy}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-foreground transition"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Syntax Highlighted Code */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSnippet}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SyntaxHighlighter
                  language={language}
                  style={prismStyles.oneLight}
                  wrapLines={false}
                  showLineNumbers={true}
                  customStyle={{
                    margin: 0,
                    padding: "22px",
                    background: "transparent",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                  codeTagProps={{
                    style: {
                      background: "transparent",
                    },
                  }}
                  PreTag="div"
                >
                  {currentSnippet || ""}
                </SyntaxHighlighter>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Button
           onClick={() => router.push("/docs")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}

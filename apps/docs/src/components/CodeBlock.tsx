"use client";

import { useRef } from "react";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
    children: string;
    language?: string;
    title?: string;
    isBad?: boolean;
    isGood?: boolean;
}

export function CodeBlock({ children, language, title, isBad, isGood }: CodeBlockProps) {
    const preRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative my-6">
            {title && (
                <div className={`font-mono text-xs px-4 sm:px-5 py-3 text-text-tertiary border border-border-primary border-b-0 rounded-t-[10px] ${isBad ?   "bg-red-500/20" : isGood ? "bg-green-500/20" : "bg-bg-tertiary"}`}>
                    {title}
                </div>

            )}
            <CopyButton text={children.trim()} />
            <div ref={preRef}>
                <pre
                    className={`m-0 border border-border-primary overflow-hidden bg-bg-code ${title ? "rounded-b-[10px] rounded-t-none" : "rounded-[10px]"
                        }`}
                >
                    <code
                        className="block px-4 sm:px-5 py-4 overflow-x-auto font-mono text-[0.8125rem] leading-relaxed text-text-primary [tab-size:2]"
                        data-language={language}
                    >                      
                        {children}
                    </code>
                </pre>
            </div>
        </div>
    );
}

"use client";

import { useRef, ReactNode } from "react";
import { CopyButton } from "./CopyButton";

interface PreProps {
    children?: ReactNode;
    [key: string]: unknown;
}

export function Pre({ children, ...props }: PreProps) {
    const preRef = useRef<HTMLPreElement>(null);

    const extractText = (node: ReactNode): string => {
        if (typeof node === "string") return node;
        if (typeof node === "number") return String(node);
        if (!node) return "";
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (typeof node === "object" && "props" in node) {
            const el = node as React.ReactElement<{ children?: ReactNode }>;
            return extractText(el.props.children);
        }
        return "";
    };

    const codeText = extractText(children);

    return (
        <div className="relative">
            <CopyButton text={codeText.trim()} />
            <pre ref={preRef} {...props}>
                {children}
            </pre>
        </div>
    );
}

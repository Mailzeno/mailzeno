import React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

type CalloutType = "info" | "warning" | "error" | "success";

interface CalloutProps {
    type?: CalloutType;
    title?: string;
    children: React.ReactNode;
}

const icons: Record<CalloutType, React.ReactNode> = {
    info: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
};

const typeStyles: Record<CalloutType, string> = {
    info: "bg-[rgb(96_165_250/0.08)] border-[rgb(96_165_250/0.2)] text-info",
    warning: "bg-[rgb(251_191_36/0.08)] border-[rgb(251_191_36/0.2)] text-warning",
    error: "bg-[rgb(248_113_113/0.08)] border-[rgb(248_113_113/0.2)] text-error",
    success: "bg-[rgb(52_211_153/0.08)] border-[rgb(52_211_153/0.2)] text-success",
};

export function Callout({ type = "info", title, children }: CalloutProps) {
    return (
        <div
            className={`p-4 sm:px-5 rounded-lg my-6 text-sm leading-relaxed border ${typeStyles[type]}`}
        >
            {title && (
                <div className="font-semibold mb-1 flex items-center gap-2">
                    <span>{icons[type]}</span>
                    <span>{title}</span>
                </div>
            )}
            <div className="[&>p]:!text-inherit [&>p]:opacity-85 [&>p]:!mb-0">
                {children}
            </div>
        </div>
    );
}

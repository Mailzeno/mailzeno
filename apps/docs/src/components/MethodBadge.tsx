interface MethodBadgeProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" ,
}

const methodStyles: Record<string, string> = {
    GET: "bg-success/15 text-success",
    POST: "bg-info/15 text-info",
    PUT: "bg-warning/15 text-warning",
    PATCH: "bg-warning/15 text-warning",
    DELETE: "bg-error/15 text-error",
    
};

export function MethodBadge({ method }: MethodBadgeProps) {
    return (
        <span
            className={`inline-flex items-center py-[0.2em] px-[0.6em] text-xs font-bold font-mono rounded tracking-wide uppercase ${methodStyles[method] ?? "bg-accent-muted text-accent-primary"}`}
        >
            {method}
        </span>
    );
}

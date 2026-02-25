import { MethodBadge } from "./MethodBadge";

interface EndpointUrlProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
}

export function EndpointUrl({ method, path }: EndpointUrlProps) {
    return (
        <div className="flex items-center gap-3 py-3 px-3 sm:px-4 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm my-4 mb-6 text-text-primary">
            <MethodBadge method={method} />
            <code>{path}</code>
        </div>
    );
}

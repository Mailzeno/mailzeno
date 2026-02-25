import type { Metadata } from "next";
import GettingStartedContent from "@content/docs/getting-started.mdx";

export const metadata: Metadata = {
    title: "Getting Started",
    description:
        "Learn what Mailzeno is and how to start sending emails with the API-first SMTP platform.",
};

export default function GettingStarted() {
    return (
        <article className="prose max-w-none">
            <GettingStartedContent />
        </article>
    );
}

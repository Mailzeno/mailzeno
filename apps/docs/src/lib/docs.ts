export interface NavItem {
    title: string;
    href: string;
    badge?: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const navigation: NavSection[] = [
    {
        title: "Overview",
        items: [
            { title: "Getting Started", href: "/getting-started" },
            { title: "Quickstart", href: "/quickstart" },
            { title: "Installation", href: "/installation" },
        ],
    },
    {
        title: "Guides",
        items: [
            { title: "Sending Emails", href: "/sending-emails" },
            { title: "Templates", href: "/templates" },
            { title: " Forms", href: "/forms", badge: "New" },
            { title: "SDK Usage", href: "/sdk" },
        ],
    },
    {
        title: "API Reference",
        items: [
            { title: "API Reference", href: "/api-reference" },
            { title: "Authentication", href: "/authentication" },
            { title: "Rate Limits", href: "/rate-limits" },
            { title: "Error Codes", href: "/error-codes" },
        ],
    },
    {
        title: "More",
        items: [
            { title: "Webhooks", href: "/webhooks", badge: "Soon" },
            { title: "Changelog", href: "/changelog" },
        ],
    },
];

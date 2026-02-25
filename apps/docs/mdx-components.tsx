import type { MDXComponents } from "mdx/types";
import { Pre } from "@/components/Pre";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { MethodBadge } from "@/components/MethodBadge";
import { EndpointUrl } from "@/components/EndpointUrl";
import { Steps, Step } from "@/components/Steps";
import { ChangelogTimeline } from "@/components/ChangelogTimeline";
import ChangelogWrapper from "@/components/ChangelogWrapper";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        pre: (props) => <Pre {...props} />,
        CodeBlock,
        Callout,
        MethodBadge,
        EndpointUrl,
        Steps,
        Step,
        ChangelogWrapper,
        ...components,
    };
}

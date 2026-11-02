import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlossaryTerm } from "./GlossaryTerm";

const components: Components = {
  a({ href, children }) {
    if (href?.startsWith("#g/")) {
      return <GlossaryTerm id={href.slice(3)}>{children}</GlossaryTerm>;
    }
    const external = !!href && /^https?:/.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
        {children}
      </a>
    );
  },
};

/** Lesson markdown. Raw HTML is not rendered, so content stays safe. */
export function Markdown({ children, className = "prose-lesson" }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

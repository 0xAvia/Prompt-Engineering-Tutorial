import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { ResolvedRequest } from "../lib/claude";
import { THINKING } from "../lib/models";

// Shows the exact API call behind a playground, so learners can move to real code later.

function pyStr(s: string): string {
  if (!s.includes("\n")) return JSON.stringify(s);
  const body = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"""${body}"""`;
}

function tsStr(s: string): string {
  if (!s.includes("\n")) return JSON.stringify(s);
  return "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
}

function pyValue(v: unknown): string {
  return JSON.stringify(v).replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None");
}

export function toPython(req: ResolvedRequest): string {
  const lines = [
    "import anthropic",
    "",
    "client = anthropic.Anthropic()  # reads your key from ANTHROPIC_API_KEY",
    "",
    "message = client.messages.create(",
    `    model=${JSON.stringify(req.model)},`,
    `    max_tokens=${req.maxTokens},`,
  ];
  if (req.system) lines.push(`    system=${pyStr(req.system)},`);
  lines.push("    messages=[");
  for (const msg of req.messages) {
    lines.push(`        {"role": ${JSON.stringify(msg.role)}, "content": ${pyStr(String(msg.content))}},`);
  }
  lines.push("    ],");
  lines.push(`    thinking=${pyValue(THINKING)},`);
  const config: Record<string, unknown> = { effort: req.effort };
  if (req.outputSchema) config.format = { type: "json_schema", schema: req.outputSchema };
  lines.push(`    output_config=${pyValue(config)},`);
  lines.push(")", "", "for block in message.content:", '    if block.type == "text":', "        print(block.text)");
  return lines.join("\n");
}

export function toTypeScript(req: ResolvedRequest): string {
  const obj = (v: unknown) => JSON.stringify(v).replace(/"(\w+)":/g, "$1: ");
  const lines = [
    'import Anthropic from "@anthropic-ai/sdk";',
    "",
    "const client = new Anthropic(); // reads your key from ANTHROPIC_API_KEY",
    "",
    "const message = await client.messages.create({",
    `  model: ${JSON.stringify(req.model)},`,
    `  max_tokens: ${req.maxTokens},`,
  ];
  if (req.system) lines.push(`  system: ${tsStr(req.system)},`);
  lines.push("  messages: [");
  for (const msg of req.messages) {
    lines.push(`    { role: ${JSON.stringify(msg.role)}, content: ${tsStr(String(msg.content))} },`);
  }
  lines.push("  ],");
  lines.push(`  thinking: ${obj(THINKING)},`);
  const config: Record<string, unknown> = { effort: req.effort };
  if (req.outputSchema) config.format = { type: "json_schema", schema: req.outputSchema };
  lines.push(`  output_config: ${obj(config)},`);
  lines.push("});", "", "for (const block of message.content) {", '  if (block.type === "text") console.log(block.text);', "}");
  return lines.join("\n");
}

export function CodeView({ req }: { req: ResolvedRequest }) {
  const [lang, setLang] = useState<"python" | "typescript">("python");
  const [copied, setCopied] = useState(false);
  const code = lang === "python" ? toPython(req) : toTypeScript(req);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-2/60">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        {(["python", "typescript"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${lang === l ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            {l === "python" ? "Python" : "TypeScript"}
          </button>
        ))}
        <span className="ml-2 hidden text-xs text-faint sm:inline">The exact API call this playground makes</span>
        <button type="button" onClick={copy} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink">
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto p-3.5 font-mono text-[0.8rem] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

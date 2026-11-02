import { md } from "../../lib/md";
import type { Chapter } from "../types";

export const ch10_2: Chapter = {
  id: "tool-use",
  number: "10.2",
  title: "Tool Use",
  level: "appendix",
  summary: "Let Claude call your code (calculators, databases, APIs) and use the results in its answers.",
  minutes: 20,
  goals: [
    "Explain how tool use works, step by step",
    "Read a tool call and a tool result",
    "Write tool descriptions that help Claude choose the right tool",
  ],
  sections: [
    {
      id: "how",
      title: "How tool use works",
      blocks: [
        {
          kind: "text",
          md: md`
            Claude can't run code, browse your database or check the weather on its own. But with **[tool use](#g/tool-use)**
            (also called function calling), it can **ask your program to do it**:

            1. You send a message, plus a list of **tools**: each with a name, a description and the inputs it takes.
            2. If a tool would help, Claude replies with a **tool call** (“please run \`calculator\` with these numbers”)
               instead of a final answer.
            3. **Your code** runs the tool and sends the **result** back.
            4. Claude uses the result to write its answer, or calls another tool.

            Claude never runs anything itself. It only asks. Your code stays in control.
          `,
        },
        {
          kind: "callout",
          tone: "changed",
          md: md`
            The original tutorial simulated tool use by describing tools in the system prompt and parsing Claude's text
            output. Today the API has **built-in tool use**: you pass tool definitions as structured data and get structured
            tool calls back, which is far more reliable. The sandboxes below use the real thing.
          `,
        },
      ],
    },
    {
      id: "calculator",
      title: "Try it: a calculator",
      blocks: [
        {
          kind: "text",
          md: md`
            Language models can get big multiplications slightly wrong. A calculator tool fixes that: Claude does the
            reasoning, your code does the exact maths.
          `,
        },
        { kind: "custom", component: "calculator-sandbox" },
      ],
    },
    {
      id: "descriptions",
      title: "Tool descriptions are prompts",
      blocks: [
        {
          kind: "text",
          md: md`
            How does Claude know *which* tool to use, and what to pass it? From the tool's **name, description and
            parameter descriptions**. Those are prompts, and everything you've learned applies: be clear, be specific, say
            what each input means, and explain edge cases.

            A good tool description says:
            - **what the tool does** and when to use it,
            - **what each parameter means** (and its format),
            - **what it returns**, and any limits or gotchas.
          `,
        },
        { kind: "custom", component: "database-exercise", exerciseId: "10.2.1" },
      ],
    },
  ],
  quiz: [
    {
      q: "When Claude “uses a tool”, who actually runs the tool?",
      options: ["Claude runs it on Anthropic's servers", "Your code runs it, then sends the result back to Claude", "The user's browser, automatically", "Nobody: Claude imagines the result"],
      answer: 1,
      explain: "Claude only requests a tool call. Your application executes it and returns the result.",
    },
    {
      q: "What's the most important thing for helping Claude pick the right tool?",
      options: ["Short tool names", "Clear tool and parameter descriptions", "Having lots of tools", "A long system prompt"],
      answer: 1,
      explain: "Descriptions are how Claude understands what a tool does and how to call it.",
    },
  ],
};

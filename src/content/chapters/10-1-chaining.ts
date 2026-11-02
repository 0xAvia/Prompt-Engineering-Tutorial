import { md } from "../../lib/md";
import type { Chapter } from "../types";

// Every word here is real, but a few look made up. That's what tempts a "fix".
const AB_LIST = `Here are 10 words that end with the letters 'ab':
1. Cab
2. Squab
3. Confab
4. Prefab
5. Kebab
6. Rehab
7. Taxicab
8. Scab
9. Stab
10. Crab`;

export const ch10_1: Chapter = {
  id: "chaining-prompts",
  number: "10.1",
  title: "Chaining Prompts",
  level: "appendix",
  summary: "Split big jobs into steps, and let Claude review and improve its own work.",
  minutes: 15,
  goals: [
    "Ask Claude to check and correct its previous answer",
    "Use a draft → review → refine loop with explicit criteria",
    "Feed one prompt's output into the next prompt",
    "Know when chaining is worth it now that Claude thinks on its own",
  ],
  sections: [
    {
      id: "rewriting",
      title: "Writing is rewriting",
      blocks: [
        {
          kind: "text",
          md: md`
            **Prompt chaining** means using the output of one call to Claude as part of the next. There are two common
            shapes:

            - **Follow-ups in the same conversation**: “Now double-check that”, “Make it better”. Claude sees its own
              previous answer and works on it.
            - **Pipelines**: a fresh prompt that receives the previous step's output as data, like a template with a
              \`{PREVIOUS}\` placeholder.

            With built-in thinking, Claude already handles most multi-step reasoning inside a single call, so you don't
            need to chain just to make it think. Chain when you want to **inspect or check the output between steps**,
            when each step needs a **different prompt** (or model), or when your app needs a **fixed pipeline** it can
            log and test step by step.

            First, let's ask Claude for something easy to get subtly wrong, then ask it to check its work. Press
            **Run the chain** to run both steps in order.
          `,
        },
        { kind: "custom", component: "chain-runner", preset: "fix-words" },
        {
          kind: "text",
          md: md`
            Does asking “are you sure?” make Claude change a *correct* answer? Below, the first answer is already correct:
            every word is real, even if a few (squab, confab, prefab) look made up. Compare a follow-up **without** an out
            to one **with** an out (Chapter 8's trick).

            Current models usually stick to a correct answer, so you may well see no difference here. Older and smaller
            models were more easily talked out of a right answer just because they were asked to look for mistakes.
          `,
        },
        {
          kind: "compare",
          before: {
            id: "10.1-ab-no-out",
            prompt: {
              history: [
                { role: "user", content: "Name ten words that all end with the exact letters 'ab'." },
                { role: "assistant", content: AB_LIST },
              ],
              user: "Please find replacements for all 'words' that are not real words.",
            },
          },
          after: {
            id: "10.1-ab-out",
            prompt: {
              history: [
                { role: "user", content: "Name ten words that all end with the exact letters 'ab'." },
                { role: "assistant", content: AB_LIST },
              ],
              user: "Please find replacements for all 'words' that are not real words. If all the words are real words, return the original list.",
            },
          },
          takeaway:
            "If both versions kept the list, that's a current model being robust. The out still costs one sentence, and it protects you on the occasions a model would otherwise change a correct answer for the sake of finding a mistake.",
        },
      ],
    },
    {
      id: "self-correct",
      title: "Draft, review, refine",
      blocks: [
        {
          kind: "text",
          md: md`
            The most useful chain is **self-correction**: Claude writes a draft, a second call reviews it against
            **explicit criteria**, and a third rewrites it to fix what the review found. “Make it better” is vague;
            a checklist tells the reviewer exactly what “better” means, and you can read the review yourself.

            Step 2 gets the draft through \`{STEP1}\`; step 3 gets both the draft and the review (\`{STEP2}\`). Try
            editing the criteria in step 2.
          `,
        },
        { kind: "custom", component: "chain-runner", preset: "self-correct" },
      ],
    },
    {
      id: "pipelines",
      title: "Pipelines: output in, output out",
      blocks: [
        {
          kind: "text",
          md: md`
            In a pipeline, each step is a separate prompt. Step 1 extracts names from a message; step 2 receives that list
            in \`{PREVIOUS}\` and sorts it. Real apps chain many steps like this: extract → analyse → write → check.
          `,
        },
        { kind: "custom", component: "chain-runner", preset: "names-pipeline" },
        {
          kind: "callout",
          tone: "tip",
          md: md`
            Asking for the output of step 1 in tags (like \`<names>\`) makes it easy for your code to pull out just the
            data before passing it on. That's the same tip as Chapter 5, put to work.
          `,
        },
      ],
    },
  ],
  quiz: [
    {
      q: "Claude already thinks before answering. When is splitting a task into a chain of prompts still worth it?",
      options: [
        "Always: every task should be chained",
        "When you want to check or log the output between steps, or each step needs a different prompt",
        "Only when using the cheapest model",
        "Never: chaining is obsolete",
      ],
      answer: 1,
      explain: "Thinking handles most multi-step reasoning in one call. Chains earn their keep when you need to inspect, check or reuse the in-between results.",
    },
    {
      q: "What is prompt chaining?",
      options: ["Writing one very long prompt", "Using the output of one Claude call as input to the next", "Linking to other websites", "Running the same prompt many times"],
      answer: 1,
      explain: "Chaining breaks a job into steps, each feeding the next.",
    },
    {
      q: "You ask Claude to double-check a list that was already correct, and it changes things anyway. What helps?",
      options: ["Ask more forcefully", "Give it an out: “If everything is correct, return the original list”", "Use capital letters", "Nothing can help"],
      answer: 1,
      explain: "An explicit out stops Claude from inventing changes just because it was asked to look for some.",
    },
  ],
};

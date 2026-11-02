import { md } from "../../lib/md";
import type { Chapter } from "../types";

const AB_LIST = `Here are 10 words that end with the letters 'ab':
1. Cab
2. Dab
3. Grab
4. Gab
5. Jab
6. Lab
7. Nab
8. Slab
9. Tab
10. Blab`;

export const ch10_1: Chapter = {
  id: "chaining-prompts",
  number: "10.1",
  title: "Chaining Prompts",
  level: "appendix",
  summary: "Split big jobs into steps, and let Claude review and improve its own work.",
  minutes: 15,
  goals: [
    "Ask Claude to check and correct its previous answer",
    "Use a draft-then-improve loop",
    "Feed one prompt's output into the next prompt",
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

            Why chain? Each step is simpler, so it's more reliable. You can inspect the output between steps. And you
            can use a different prompt (or model) for each job.

            First, let's ask Claude for something easy to get subtly wrong, then ask it to check its work. Press
            **Run the chain** to run both steps in order.
          `,
        },
        { kind: "custom", component: "chain-runner", preset: "fix-words" },
        {
          kind: "text",
          md: md`
            Does asking “are you sure?” make Claude change a *correct* answer? Below, the first answer is already correct
            (every word is real). Compare a follow-up **without** an out to one **with** an out (Chapter 8's trick). Run each a
            few times.
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
          takeaway: "With an out, Claude is much more likely to stick to a correct answer instead of changing things for the sake of it.",
        },
      ],
    },
    {
      id: "improve",
      title: "Draft, then improve",
      blocks: [
        {
          kind: "text",
          md: md`
            You can also simply ask Claude to make its work better. Tastes vary, but the second draft is often stronger.
            Try more specific follow-ups too: “Make it funnier”, “Cut it to two sentences”, “Add a twist ending”.
          `,
        },
        { kind: "custom", component: "chain-runner", preset: "improve-story" },
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

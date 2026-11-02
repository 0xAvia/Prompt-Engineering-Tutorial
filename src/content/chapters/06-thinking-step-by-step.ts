import { usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import { CATEGORY_LIST, answerTag, emailCases, letterAndName } from "../docs/emails";
import type { Chapter } from "../types";

const REVIEW = "This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since the year 1900.";

const SEATS =
  "Four friends (Ana, Ben, Cara and Dev) sit in a row of four seats numbered 1 to 4. Dev sits in seat 1. Ben is not at either end. Cara sits directly to the right of Ana. Who sits in each seat?";

const SEVENS = "How many times does the digit 7 appear when you write out every whole number from 1 to 100?";

export const ch06: Chapter = {
  id: "thinking-step-by-step",
  number: "6",
  title: "Letting Claude Think",
  level: "intermediate",
  summary: "Claude reasons before it answers. Control how hard it thinks, point that thinking at what matters, and make answers you can check.",
  minutes: 20,
  goals: [
    "Explain Claude's built-in thinking and peek at a summary of it",
    "Use the effort setting to trade speed and cost for thoroughness",
    "Tell Claude what to consider, and ask for answers you can check",
  ],
  sections: [
    {
      id: "built-in",
      title: "Claude thinks before it answers",
      blocks: [
        {
          kind: "text",
          md: md`
            If someone fired a tricky question at you, you'd do better with a moment to think it through. Current Claude
            models have that moment built in: before writing a reply, Claude can **[think](#g/thinking)** privately, and
            it decides for itself how much. Easy questions get an instant answer; puzzles get real reasoning.

            Run this puzzle, then open **“What Claude was thinking”** in the answer to see a summary of the reasoning.
          `,
        },
        { kind: "playground", example: { id: "6-seats", title: "A seating puzzle", prompt: { user: SEATS, effort: "low" } } },
        {
          kind: "callout",
          tone: "changed",
          md: md`
            The original tutorial taught you to write “think step by step” and to ask for the reasoning inside
            \`<thinking>\` tags in the answer. Models back then couldn't think any other way. Current models think on
            their own, so that instruction is mostly redundant. And asking Claude to write out its full reasoning in the
            answer costs extra tokens; some larger models may even decline requests to reproduce their reasoning.
            The tools in this chapter replace it.
          `,
        },
      ],
    },
    {
      id: "effort",
      title: "Effort: how hard Claude thinks",
      blocks: [
        {
          kind: "text",
          md: md`
            You control the depth of thinking with a setting called **[effort](#g/effort)**: low, medium or high.
            Higher effort means more thinking, which usually means better answers on hard problems, but also slower
            replies and more tokens to pay for. Telling Claude in the prompt to “think harder” or “don't overthink” is
            much less reliable than changing the setting.

            Run both versions below and compare the **token count and time** in each answer's header, and how long the
            thinking summary is.
          `,
        },
        {
          kind: "compare",
          labels: ["Option A", "Option B"],
          before: { id: "6-sevens-low", title: "Low effort", prompt: { user: SEVENS, effort: "low" } },
          after: { id: "6-sevens-high", title: "High effort", prompt: { user: SEVENS, effort: "high" } },
          takeaway:
            "The answer is 20 (ten in the units place, ten in the seventies). Low effort is plenty for most simple tasks. Raise it when getting it right matters more than speed and cost.",
        },
        {
          kind: "callout",
          tone: "tip",
          md: md`
            This course runs at **low** effort by default to keep things fast and cheap. Wherever you see the **Effort**
            selector, you can turn it up and watch what changes.
          `,
        },
      ],
    },
    {
      id: "what-to-consider",
      title: "Point the thinking at what matters",
      blocks: [
        {
          kind: "text",
          md: md`
            Effort controls *how much* Claude thinks. Your prompt controls *what about*. If you know where the trap is,
            say so. This review sounds glowing, but the second sentence is sarcastic: if you've been “living under a rock
            since 1900”, everything seems fresh. A hint about what to look for helps Claude weigh the clues instead of
            reacting to the first sentence.
          `,
        },
        {
          kind: "compare",
          before: { id: "6-review-plain", prompt: { user: `Is this movie review sentiment positive or negative?\n\n<review>\n${REVIEW}\n</review>` } },
          after: {
            id: "6-review-guided",
            prompt: {
              system: "You are a savvy reader of movie reviews.",
              user: `Is this movie review sentiment positive or negative? Reviewers are sometimes sarcastic, so consider whether each sentence is meant sincerely before you decide.\n\n<review>\n${REVIEW}\n</review>`,
            },
          },
          takeaway: "Telling Claude *what to consider* (sarcasm, both sides, a likely mistake) is the modern way to guide its reasoning.",
        },
      ],
    },
    {
      id: "checkable",
      title: "Make answers you can check",
      blocks: [
        {
          kind: "text",
          md: md`
            Sometimes you need to know *why* Claude gave an answer, so you can trust it. Instead of asking for all its
            reasoning, ask for **the answer plus the key facts it relied on**. That's short, and it's exactly what you need
            to verify it.

            Questions that combine two facts (“an actor born in 1956” *and* “a famous movie”) are easy to get subtly wrong.
            Asking for the supporting facts makes a wrong answer easy to spot.
          `,
        },
        {
          kind: "compare",
          before: { id: "6-actor-plain", prompt: { user: "Name a famous movie starring an actor who was born in the year 1956." } },
          after: {
            id: "6-actor-checkable",
            prompt: {
              user: "Name a famous movie starring an actor who was born in the year 1956. Give the movie, then the actor and their exact date of birth, so I can check it.",
            },
          },
          takeaway: "Now you can check it: Tom Hanks, Mel Gibson and Bryan Cranston were all born in 1956.",
        },
      ],
    },
    {
      id: "exercises",
      title: "Exercises",
      blocks: [
        {
          kind: "text",
          md: md`
            These two exercises run your prompt **once for each of four customer emails** and check every answer. The
            emails go into the \`{email}\` placeholder. The categories are:

            - **(A)** Pre-sale question
            - **(B)** Broken or defective item
            - **(C)** Billing question
            - **(D)** Other (please explain)
          `,
        },
        {
          kind: "exercise",
          exercise: {
            id: "6.1",
            title: "Classify the emails",
            goal: md`
              The starting prompt is nonsense (green or blue?). Rewrite it so Claude puts each email in the right category
              and answers with **the letter in parentheses plus the category name**, like “(B) Broken or defective item”.
              Keep the \`{email}\` placeholder in your prompt.
            `,
            start: { user: "Please classify this email as either green or blue: {email}", effort: "low" },
            editable: ["user"],
            promptCriteria: [usesVariable("email")],
            cases: emailCases(letterAndName),
            hints: [
              "Claude can't know your categories unless you list them. Put them in the prompt, ideally inside `<categories>` tags.",
              "Ask for the classification and nothing else, in the exact format “(B) Broken or defective item”.",
              "Email 2 is ambiguous: either (A) or (D) counts. If others are misclassified, explain the tricky boundary (what counts as “Other”?), or try medium effort.",
            ],
            solution: {
              user: `Please classify this email into one of the following categories:\n\n<categories>\n${CATEGORY_LIST}\n</categories>\n\n<email>\n{email}\n</email>\n\nAnswer with only the category letter in parentheses followed by the full category name, for example "(B) Broken or defective item".`,
              effort: "low",
            },
            takeaway: "Listing the options, wrapping the input in tags and pinning down the answer format turned a vague prompt into a reliable classifier.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "6.2",
            title: "A checkable classification",
            goal: md`
              Now make each answer easy to check *and* easy for a program to read: a **one-sentence reason**, then **just
              the letter** inside \`<answer>\` tags, for example \`<answer>B</answer>\`.
            `,
            start: { user: "Please classify this email as either green or blue: {email}", effort: "low" },
            editable: ["user"],
            promptCriteria: [usesVariable("email")],
            cases: emailCases(answerTag),
            hints: [
              "Start from your 6.1 solution and change the output instructions.",
              "Show the exact format you want: “Give a one-sentence reason, then only the letter in <answer></answer> tags, for example <answer>B</answer>.”",
              "If an email is misclassified, read the reason Claude gave: it usually shows which category description needs to be clearer.",
            ],
            solution: {
              user: `Please classify this email into one of the following categories:\n\n<categories>\n${CATEGORY_LIST}\n</categories>\n\n<email>\n{email}\n</email>\n\nGive a one-sentence reason for your choice. Then write only the category letter inside <answer></answer> tags, for example <answer>B</answer>.`,
              effort: "low",
            },
            takeaway: "A short reason you can read, plus a tagged answer a program can read: the best of both.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "With current models, what's the most reliable way to make Claude think harder about a difficult problem?",
      options: ["Write “THINK STEP BY STEP” in capitals", "Raise the effort setting", "Ask it to write out all its reasoning in the answer", "Repeat the question twice"],
      answer: 1,
      explain: "Effort is the control for how much Claude thinks. Prompt wording like “think harder” is much less reliable.",
    },
    {
      q: "You need to check how Claude reached an answer. What's the best request?",
      options: [
        "“Show me your complete internal reasoning”",
        "“Give the answer, then the key facts you relied on”",
        "“Answer instantly without thinking”",
        "There's no way to check",
      ],
      answer: 1,
      explain: "The answer plus its supporting facts is short and exactly what you need to verify it.",
    },
    {
      q: "Why not run everything at high effort?",
      options: ["High effort is less accurate", "It's slower and uses more tokens, which cost money", "It's only for Opus", "It turns thinking off"],
      answer: 1,
      explain: "Thinking tokens are billed like output tokens. Use the lowest effort that gives good results for the task.",
    },
  ],
};

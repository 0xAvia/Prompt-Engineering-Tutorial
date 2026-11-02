import { usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import { CATEGORY_LIST, answerTag, emailCases, letterAndName } from "../docs/emails";
import type { Chapter } from "../types";

const REVIEW = "This movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since the year 1900.";
const ACTOR = "Name a famous movie starring an actor who was born in the year 1956.";

export const ch06: Chapter = {
  id: "thinking-step-by-step",
  number: "6",
  title: "Thinking Step by Step",
  level: "intermediate",
  summary: "Give Claude room to reason before it answers, either in the prompt or with built-in thinking.",
  minutes: 20,
  goals: [
    "Ask Claude to reason out loud before answering, using tags",
    "Notice how the order of options can sway an answer",
    "Use Claude's built-in thinking mode and know when it helps",
  ],
  sections: [
    {
      id: "why-think",
      title: "Thinking first leads to better answers",
      blocks: [
        {
          kind: "text",
          md: md`
            If someone woke you up and fired a tricky question at you, you'd do better if you could think it through
            first. Claude is the same: **giving it space to reason before it commits to an answer** often makes it more
            accurate, especially on tasks with several steps or a subtle twist.

            Here's a subtle one. The review sounds positive, but the second sentence is sarcastic (if you've been
            “living under a rock since 1900”, everything seems fresh). Does Claude catch it?
          `,
        },
        {
          kind: "compare",
          before: { id: "6-review-plain", prompt: { user: `Is this movie review sentiment positive or negative?\n\n${REVIEW}` } },
          after: {
            id: "6-review-think",
            prompt: {
              system: "You are a savvy reader of movie reviews.",
              user: `Is this review sentiment positive or negative? First, write the best arguments for each side in <positive-argument> and <negative-argument> XML tags, then answer.\n\n${REVIEW}`,
            },
          },
          takeaway: "Spelling out *how* to think (argue both sides, then decide) helps Claude weigh the clues instead of reacting to the first sentence.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Thinking only counts if it happens",
          md: md`
            Writing “think carefully, but only give me the answer” in a prompt doesn't make Claude think. The reasoning
            has to actually be **written out** (in the response, or with built-in thinking, below). Ask for the reasoning
            in tags like \`<thinking>\` so it's easy to separate from the final answer.
          `,
        },
      ],
    },
    {
      id: "order",
      title: "Order can sway the answer",
      blocks: [
        {
          kind: "text",
          md: md`
            Claude can be sensitive to **the order you list options in**. On borderline questions like this one,
            swapping “positive or negative” for “negative or positive” can tip the verdict. A tendency to favour the
            second option has been observed in language models. Run this a few times and compare with the “After”
            version above.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "6-review-swapped",
            title: "Same task, options swapped",
            prompt: {
              system: "You are a savvy reader of movie reviews.",
              user: `Is this review sentiment negative or positive? First write the best arguments for each side in <negative-argument> and <positive-argument> XML tags, then answer.\n\n${REVIEW}`,
            },
          },
        },
      ],
    },
    {
      id: "brainstorm",
      title: "Brainstorm, then answer",
      blocks: [
        {
          kind: "text",
          md: md`
            Letting Claude think can turn a wrong answer into a right one. Questions that combine two facts (“an actor
            born in 1956” *and* “a famous movie”) are easy to get subtly wrong in one shot. Asking Claude to brainstorm
            first lets it check its own facts.
          `,
        },
        {
          kind: "compare",
          before: { id: "6-actor-plain", prompt: { user: ACTOR } },
          after: {
            id: "6-actor-brainstorm",
            prompt: { user: `${ACTOR} First brainstorm about some actors and their birth years in <brainstorm> tags, then give your answer.` },
          },
          takeaway: "Check the answers: Tom Hanks, Mel Gibson and Bryan Cranston were all born in 1956.",
        },
      ],
    },
    {
      id: "built-in-thinking",
      title: "Built-in thinking",
      blocks: [
        {
          kind: "callout",
          tone: "changed",
          md: md`
            When the original tutorial was written, “think step by step” in the prompt was the only option. Current Claude
            models also have **built-in [thinking](#g/thinking)**: switch it on and Claude reasons privately before it
            answers, without you asking. You can peek at a summary of that reasoning.
          `,
        },
        {
          kind: "text",
          md: md`
            Turn on **Built-in thinking** below, run it, then open **“What Claude was thinking”** in the answer.

            | | Thinking in the prompt | Built-in thinking |
            |---|---|---|
            | How | “Think step by step in \`<thinking>\` tags” | A switch (an API setting) |
            | You see | The full reasoning, in the answer | A summary, kept separate |
            | Good for | Reasoning you want to read, check or show users | Hard problems, with no prompt changes |
            | Cost | Reasoning counts as output tokens | Thinking counts as output tokens too |

            Both cost a bit more and take a bit longer, so save them for tasks that need it.
          `,
        },
        {
          kind: "playground",
          example: { id: "6-actor-thinking", title: "Try built-in thinking", prompt: { user: ACTOR, thinking: false } },
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
            These two exercises run your prompt template **once for each of four customer emails** and check every
            answer. The emails go into the \`{email}\` placeholder. The categories are:

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
              The starting prompt is nonsense (green or blue?). Rewrite it so Claude classifies each email into the
              right category and answers with **the letter in parentheses plus the category name**, like
              “(B) Broken or defective item”. Keep the \`{email}\` placeholder in your prompt.
            `,
            start: { user: "Please classify this email as either green or blue: {email}", thinking: false },
            editable: ["user"],
            promptCriteria: [usesVariable("email")],
            cases: emailCases(letterAndName),
            hints: [
              "Claude can't know your categories unless you list them. Put them in the prompt, ideally inside `<categories>` tags.",
              "Ask for the classification and **only** the classification, in the exact format “(B) Broken or defective item”, with no preamble.",
              "Email 2 is ambiguous: either (A) or (D) counts. If others are misclassified, try asking Claude to think it through first, in `<thinking>` tags or with built-in thinking, before giving the category.",
            ],
            solution: {
              user: `Please classify this email into one of the following categories:\n\n<categories>\n${CATEGORY_LIST}\n</categories>\n\n<email>\n{email}\n</email>\n\nAnswer with only the category letter in parentheses followed by the full category name, for example "(B) Broken or defective item". Do not include any other words.`,
              thinking: false,
            },
            takeaway: "Listing the options, wrapping the input in tags and pinning down the answer format turned a vague prompt into a reliable classifier.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "6.2",
            title: "Format the classification",
            goal: md`
              Now change the output: Claude should put **just the letter** of the category inside \`<answer>\` tags,
              for example \`<answer>B</answer>\`. It may think or explain before that, as long as the tag is there.
            `,
            start: { user: "Please classify this email as either green or blue: {email}", thinking: false },
            editable: ["user"],
            promptCriteria: [usesVariable("email")],
            cases: emailCases(answerTag),
            hints: [
              "Start from your 6.1 solution and change the output instructions.",
              "Show the exact format you want: “Put only the letter in <answer></answer> tags, for example <answer>B</answer>.”",
              "Asking Claude to reason in `<thinking>` tags *before* the `<answer>` tag often fixes misclassifications.",
            ],
            solution: {
              user: `Please classify this email into one of the following categories:\n\n<categories>\n${CATEGORY_LIST}\n</categories>\n\n<email>\n{email}\n</email>\n\nFirst think about which category fits best in <thinking> tags. Then write only the category letter inside <answer></answer> tags, for example <answer>B</answer>.`,
              thinking: false,
            },
            takeaway: "Reasoning first, then a tagged answer: you get better accuracy *and* an answer a program can extract.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "You write: “Think about this carefully, but only output the final answer.” Does Claude get the benefit of thinking?",
      options: ["Yes, it thinks silently", "No: reasoning only helps when it's actually written out (or built-in thinking is on)", "Only on big models", "Only if you say please"],
      answer: 1,
      explain: "Thinking has to happen somewhere: in the visible response, or in built-in thinking.",
    },
    {
      q: "Why put Claude's reasoning in `<thinking>` tags?",
      options: ["It's required by the API", "It makes the reasoning easy to separate from the final answer", "It makes Claude faster", "Claude can't reason without tags"],
      answer: 1,
      explain: "Tags let you (or your code) read the reasoning and the answer separately.",
    },
    {
      q: "Which is true about built-in thinking?",
      options: [
        "It's free",
        "You must also write “think step by step”",
        "It's a setting that lets Claude reason before answering, and its tokens are billed as output",
        "It replaces the system prompt",
      ],
      answer: 2,
      explain: "Built-in thinking is switched on with an API setting. Thinking tokens cost the same as output tokens, so use it where it helps.",
    },
  ],
};

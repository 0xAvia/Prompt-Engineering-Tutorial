import { matches, usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter, TestCase } from "../types";

const REVIEWS: { label: string; review: string; sentiment: "positive" | "negative" | "mixed" }[] = [
  { label: "Happy customer", review: "Absolutely love it. The battery lasts all day and it looks great on my desk.", sentiment: "positive" },
  { label: "Unhappy customer", review: "Broke after two days. Support never answered any of my emails.", sentiment: "negative" },
  { label: "Good and bad", review: "Gorgeous screen, but the battery barely lasts until lunch.", sentiment: "mixed" },
  { label: "Sarcasm", review: "Oh fantastic, another charger that stopped working after a week. Just what I needed.", sentiment: "negative" },
  { label: "Double negative", review: "I wasn't expecting much, but honestly it's not bad at all. I'd buy it again.", sentiment: "positive" },
  { label: "Shipping vs product", review: "Shipping took three weeks and the box arrived dented, but the speaker itself sounds amazing.", sentiment: "mixed" },
];

const cases: TestCase[] = REVIEWS.map((r) => ({
  label: r.label,
  variables: { REVIEW: r.review },
  expected: `<label>${r.sentiment}</label>`,
  criteria: [matches(new RegExp(`<label>\\s*${r.sentiment}\\s*</label>`, "i"), `Contains <label>${r.sentiment}</label>`)],
}));

export const ch10_4: Chapter = {
  id: "testing-prompts",
  number: "10.4",
  title: "Testing Your Prompts",
  level: "appendix",
  summary: "Stop guessing whether a change helped: build a small test set and measure.",
  minutes: 15,
  goals: [
    "Explain what an eval is and why it beats eyeballing",
    "Write test cases that include tricky edge cases",
    "Improve a prompt by measuring its pass rate",
  ],
  sections: [
    {
      id: "evals",
      title: "Measure, don't guess",
      blocks: [
        {
          kind: "text",
          md: md`
            You've probably noticed that a prompt can work perfectly on one input and fail on the next, and that
            Claude's answers vary between runs. So how do you know a change actually made your prompt *better*?

            You test it, the same way software is tested. A set of test cases with known good answers is called an
            **[eval](#g/eval)**. It has three parts:

            1. **Test cases**: realistic inputs, *especially* the tricky ones (sarcasm, ambiguity, missing information).
            2. **Expected results**: what a good answer looks like for each.
            3. **A grader**: a way to score each answer. That can be code (exact match, “contains”), a rubric scored by another
               Claude call (“LLM-as-judge”), or a human.

            You've been using evals all along: every multi-input exercise in this course is one. The loop is simple:
            **run the whole set → read the failures → change one thing → run it again.**
          `,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Good habits",
          md: md`
            - **Change one thing at a time**, so you know what helped.
            - **Re-run more than once.** Answers vary; a prompt that passes 6/6 once might pass 5/6 the next time.
            - **Don't overfit.** If you tune a prompt to pass these exact cases, keep a few extra cases aside to check it
              still works on inputs it hasn't seen.
            - **Add every real failure** you find to your test set, so it never comes back.
          `,
        },
      ],
    },
    {
      id: "exercise",
      title: "Exercise",
      blocks: [
        {
          kind: "exercise",
          exercise: {
            id: "10.4.1",
            title: "Pass the sentiment eval",
            goal: md`
              Here's a six-case eval for a review classifier. Each review must be labelled **positive**, **negative** or
              **mixed**, in the exact format \`<label>mixed</label>\`. The starting prompt fails most cases. Improve it until
              it passes all six, then run it again to make sure it wasn't luck.
            `,
            start: { user: "Is this review positive or negative?\n\n{REVIEW}" },
            editable: ["user"],
            promptCriteria: [usesVariable("REVIEW")],
            cases,
            hints: [
              "The starting prompt doesn't even offer “mixed”, and doesn't ask for the <label> format. Fix those first, then run the eval.",
              "Define each label: e.g. “mixed: the review contains clear praise *and* clear criticism”. Warn about sarcasm.",
              "If the tricky cases still fail, let Claude reason briefly in <thinking> tags before the <label>, or add an example or two.",
            ],
            solution: {
              user: `Classify the sentiment of this product review as positive, negative, or mixed.
- positive: the reviewer is happy overall
- negative: the reviewer is unhappy overall (watch out for sarcasm)
- mixed: the review contains clear praise and clear criticism

<review>
{REVIEW}
</review>

Think briefly in <thinking> tags, then give your answer as exactly one word inside <label></label> tags.`,
            },
            takeaway: "That's prompt engineering as a discipline: a test set, a score, and changes you can prove helped.",
          },
        },
        {
          kind: "text",
          md: md`
            ### You've finished the course!

            You now have the full toolkit, from writing a clear first prompt to testing a production one. Keep practising in
            the [Playground](#/playground) on problems you care about. That's where it really sticks.
          `,
        },
      ],
    },
  ],
  quiz: [
    {
      q: "What's an eval?",
      options: ["A model setting", "A set of test cases with known good answers, used to measure a prompt", "A type of system prompt", "Anthropic's grading service"],
      answer: 1,
      explain: "Evals turn “seems better” into a number you can compare.",
    },
    {
      q: "Your prompt passes all six cases once. What should you do next?",
      options: ["Ship it immediately", "Run it again, and try it on a few extra cases it wasn't tuned on", "Delete the hard cases", "Switch models"],
      answer: 1,
      explain: "Answers vary between runs, and prompts can overfit to the cases you tuned on.",
    },
  ],
};

import { containsAny, matches, usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import { MATTERPORT_10K } from "../docs/matterport";
import type { Chapter } from "../types";

const admitsUncertainty = containsAny(
  [
    "don't know",
    "do not know",
    "not sure",
    "unsure",
    "don't have",
    "do not have",
    "no reliable",
    "not able to",
    "unable to",
    "can't confirm",
    "cannot confirm",
    "can't verify",
    "cannot verify",
    "not certain",
    "uncertain",
    "unfortunately",
    "not aware",
  ],
  { label: "Admits it doesn't know instead of inventing a name" },
);

export const ch08: Chapter = {
  id: "avoiding-hallucinations",
  number: "8",
  title: "Avoiding Hallucinations",
  level: "advanced",
  summary: "Make Claude more honest: give it permission to say “I don't know”, and have it quote evidence before answering.",
  minutes: 20,
  goals: [
    "Explain what a hallucination is and why it happens",
    "Give Claude an “out” so it can admit uncertainty",
    "Make Claude gather quotes from a document before answering",
  ],
  sections: [
    {
      id: "what",
      title: "When Claude makes things up",
      blocks: [
        {
          kind: "text",
          md: md`
            Some bad news: language models sometimes **[hallucinate](#g/hallucination)**. They state things that are
            false or unsupported, often with complete confidence. It happens partly because Claude is trained to be
            helpful: faced with a question, it tries hard to produce an answer.

            The good news: a few prompting habits reduce it dramatically. This chapter covers two of the most effective:

            1. **Give Claude an out**: permission to say it doesn't know.
            2. **Evidence first**: have Claude find supporting quotes before it answers.
          `,
        },
      ],
    },
    {
      id: "an-out",
      title: "Give Claude an out",
      blocks: [
        {
          kind: "text",
          md: md`
            “Who is the heaviest hippo of all time?” sounds like it has a clear answer, but nobody has reliably weighed
            every hippo in history. A model eager to help may name a specific hippo and weight anyway. Tell Claude it's
            **fine not to answer** unless it's sure:
          `,
        },
        {
          kind: "compare",
          before: { id: "8-hippo-plain", prompt: { user: "Who is the heaviest hippo of all time?" } },
          after: { id: "8-hippo-out", prompt: { user: "Who is the heaviest hippo of all time? Only answer if you know the answer with certainty." } },
          takeaway: "Permission to say “I don't know” is often all it takes for Claude to stop guessing.",
        },
      ],
    },
    {
      id: "evidence",
      title: "Evidence before answers",
      blocks: [
        {
          kind: "text",
          md: md`
            Hallucinations are especially tricky with **long documents**, where there's often *almost*-relevant
            “distractor” information. Below, Claude gets a long excerpt from a company's annual report and a question
            whose exact answer **isn't in the document**: subscriber numbers on May 31, 2020. The document has subscriber
            numbers for *other* dates, which makes a wrong answer tempting.

            The fix: tell Claude to **pull out the most relevant quote first**, then judge whether it actually answers the
            question, in a \`<scratchpad>\`, before writing the answer.
          `,
        },
        {
          kind: "compare",
          before: {
            id: "8-matterport-plain",
            prompt: {
              user: "<question>What was Matterport's subscriber base on the precise date of May 31, 2020?</question>\nPlease read the below document. Then write a brief numerical answer inside <answer> tags.\n<document>\n{DOCUMENT}\n</document>",
              variables: { DOCUMENT: MATTERPORT_10K },
            },
          },
          after: {
            id: "8-matterport-evidence",
            prompt: {
              user: "<question>What was Matterport's subscriber base on the precise date of May 31, 2020?</question>\nPlease read the below document. Then, in <scratchpad> tags, pull the most relevant quote from the document and consider whether it answers the user's question or whether it lacks sufficient detail. Then write a brief numerical answer in <answer> tags.\n<document>\n{DOCUMENT}\n</document>",
              variables: { DOCUMENT: MATTERPORT_10K },
            },
          },
          takeaway: "Quoting first forces Claude to check its answer against the text, so it notices when the text doesn't actually say.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Where to put the question",
          md: md`
            These examples put the question at the top so it's easy to read. In real prompts with long documents,
            **put the document first and the question at the end**. Claude tends to do better that way. You'll see this
            in Chapter 9.
          `,
        },
        {
          kind: "callout",
          tone: "changed",
          md: md`
            The original tutorial also suggested lowering the **temperature** setting to make answers more consistent.
            Current Claude models no longer let you change it, so the prompt techniques in this chapter are your main
            tools. (It's also why answers vary a little from run to run.)
          `,
        },
      ],
    },
    {
      id: "exercises",
      title: "Exercises",
      blocks: [
        {
          kind: "exercise",
          exercise: {
            id: "8.1",
            title: "Don't invent a mayor",
            goal: md`
              Hardly anyone knows who was mayor of a small Austrian village in 1987, and Claude almost certainly
              doesn't either. Run the prompt first and see whether Claude names someone confidently. Then **give Claude an out** so it
              admits it doesn't know instead of guessing.
            `,
            start: { user: "Who was the mayor of Hallstatt, Austria in 1987?" },
            editable: ["user"],
            criteria: [admitsUncertainty],
            hints: [
              "What should Claude do if it doesn't know the answer? Tell it.",
              "Add something like: “Only answer if you know with certainty. If you're not sure, say that you don't know.”",
            ],
            solution: {
              user: "Who was the mayor of Hallstatt, Austria in 1987? Only answer if you know the answer with certainty. If you are not sure, say that you don't know rather than guessing.",
            },
            takeaway: "Claude is trained to be helpful. Explicit permission not to answer stops it from trying to be helpful by guessing.",
          },
        },
        {
          kind: "callout",
          tone: "changed",
          md: md`
            The original exercise asked for the year of Beyoncé's eighth studio album, which didn't exist at the time.
            She has since released it (*Cowboy Carter*, 2024), so the question now has a real answer. We swapped in a
            question that's still a hallucination trap.
          `,
        },
        {
          kind: "exercise",
          exercise: {
            id: "8.2",
            title: "Find the growth figure",
            goal: md`
              The question asks how much Matterport's subscribers grew from December 2018 to December 2022. The answer is
              in the document: about **49-fold**. Edit the prompt so Claude **gathers relevant quotes first**, then answers
              based on them. Keep \`{DOCUMENT}\` in your prompt.
            `,
            start: {
              user: "From December 2018 to December 2022, by what amount did Matterport's subscribers grow?\n<document>\n{DOCUMENT}\n</document>",
              variables: { DOCUMENT: MATTERPORT_10K },
            },
            editable: ["user"],
            promptCriteria: [usesVariable("DOCUMENT"), { label: "Your prompt asks for quotes from the document", test: (t) => /quot/i.test(t) }],
            criteria: [matches(/49[- ]?(fold|x\b|×|times)/i, "Answer gives the 49-fold growth figure")],
            hints: [
              "Ask Claude to first pull out the quotes that are relevant to the question, in tags like `<quotes>`.",
              "Move the question to the end, after the document, and ask Claude to answer only based on the quotes it found.",
            ],
            solution: {
              user: "<document>\n{DOCUMENT}\n</document>\n\nFrom December 2018 to December 2022, by what amount did Matterport's subscribers grow?\n\nFirst, extract the quotes from the document that are most relevant to this question, in <quotes> tags. Then answer the question in <answer> tags, based only on those quotes.",
              variables: { DOCUMENT: MATTERPORT_10K },
            },
            takeaway: "Quotes first, answer second: it keeps Claude grounded in the document, and lets you check its work.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "What's a hallucination?",
      options: ["When Claude refuses to answer", "When Claude states something false or unsupported as if it were true", "A very creative answer", "An error from the API"],
      answer: 1,
      explain: "Hallucinations are confident-sounding answers that aren't true or aren't backed by the source.",
    },
    {
      q: "What does “giving Claude an out” mean?",
      options: [
        "Letting it end the conversation",
        "Explicitly telling it that it's fine to say it doesn't know",
        "Giving it a shorter prompt",
        "Using a different model",
      ],
      answer: 1,
      explain: "Permission to say “I don't know” reduces the pressure to invent an answer.",
    },
    {
      q: "With a long document, which order works best?",
      options: [
        "Question first, then document",
        "Document first, then the question, and ask for relevant quotes before the answer",
        "Split the document across several messages",
        "Order doesn't matter",
      ],
      answer: 1,
      explain: "Put long documents at the top, the question near the end, and have Claude quote its evidence before answering.",
    },
  ],
};

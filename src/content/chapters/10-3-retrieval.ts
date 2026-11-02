import { containsAny, matches, usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import { formatDocs, retrieve } from "../retrieval";
import type { Chapter, TestCase } from "../types";

const ragCase = (question: string, expected: string, criteria: TestCase["criteria"]): TestCase => ({
  label: question,
  variables: { QUESTION: question, DOCUMENTS: formatDocs(retrieve(question)) },
  expected,
  criteria,
});

const START = "Answer the question.\n\n{DOCUMENTS}\n\n{QUESTION}";

export const ch10_3: Chapter = {
  id: "search-and-retrieval",
  number: "10.3",
  title: "Search & Retrieval",
  level: "appendix",
  summary: "Give Claude the right documents at the right time, and make it answer only from them.",
  minutes: 20,
  goals: [
    "Explain retrieval-augmented generation (RAG) in plain terms",
    "Write a prompt that keeps Claude grounded in retrieved documents",
    "Get Claude to cite sources and admit when the answer isn't there",
  ],
  sections: [
    {
      id: "rag",
      title: "Look it up first",
      blocks: [
        {
          kind: "text",
          md: md`
            Claude knows a lot, but not *your* company's policies, last week's meeting notes or a customer's order history.
            The fix is **[retrieval](#g/rag)**: when a question comes in, your app first **searches** your documents, then
            puts the best matches into the prompt and asks Claude to answer **from them**.

            It's the techniques you already know, combined:
            - documents in **XML tags** (Chapter 4),
            - an **out** for when the answer isn't there, and **quotes or citations** as evidence (Chapter 8),
            - a clear **output format** (Chapter 5).

            Real systems use smarter search (like “embeddings” that match by meaning), but the prompting is the same.
            Try the whole pipeline here, including a question the documents *can't* answer.
          `,
        },
        { kind: "custom", component: "retrieval-sandbox" },
      ],
    },
    {
      id: "exercise",
      title: "Exercise",
      blocks: [
        {
          kind: "exercise",
          exercise: {
            id: "10.3.1",
            title: "Grounded, cited answers",
            goal: md`
              The starting template just dumps the documents and question in. Improve it so that, for all three questions,
              Claude **answers only from the documents**, **cites the document id in square brackets** (like \`[2]\`), and
              **says it doesn't have the information** when the documents don't cover the question. Keep \`{DOCUMENTS}\` and
              \`{QUESTION}\` in your template.
            `,
            start: { user: START },
            editable: ["user"],
            promptCriteria: [usesVariable("DOCUMENTS"), usesVariable("QUESTION")],
            cases: [
              ragCase("How long is the warranty on e-bike batteries?", "3 years (or 800 charge cycles), citing [2]", [
                containsAny(["3 years", "three years"], { label: "Says 3 years" }),
                matches(/\[2\]/, "Cites document [2]"),
              ]),
              ragCase("Is the Seattle store open on Mondays?", "No, it's closed on Mondays, citing [5]", [
                containsAny(["closed", "not open", "isn't open", "is not open"], { label: "Says it's closed on Mondays" }),
                matches(/\[5\]/, "Cites document [5]"),
              ]),
              ragCase("Do you sell skateboards?", "Says the documents don't cover this", [
                containsAny(
                  [
                    "don't have",
                    "do not have",
                    "no information",
                    "not mention",
                    "doesn't mention",
                    "does not mention",
                    "don't mention",
                    "do not mention",
                    "not covered",
                    "doesn't cover",
                    "don't cover",
                    "not in the",
                    "couldn't find",
                    "could not find",
                    "don't know",
                    "do not know",
                    "not able to find",
                    "unable to find",
                    "no mention",
                    "don't contain",
                    "do not contain",
                    "doesn't contain",
                    "does not contain",
                  ],
                  { label: "Says the documents don't cover it, instead of guessing" },
                ),
              ]),
            ],
            hints: [
              "Wrap `{DOCUMENTS}` in `<documents>` tags and `{QUESTION}` in `<question>` tags, and put the question last.",
              "Spell out the rules: answer only from the documents; cite the document id in square brackets after each fact, like [3].",
              "Give Claude an out: “If the documents don't contain the answer, say that you don't have that information.”",
            ],
            solution: {
              user: `Here are some articles from the Brightwater Bikes help centre:
<documents>
{DOCUMENTS}
</documents>

Answer the customer's question using only the information in these documents. After each fact you use, cite the document's id in square brackets, like [3]. If the documents don't contain the answer, say that you don't have that information rather than guessing.

<question>
{QUESTION}
</question>`,
            },
            takeaway: "Grounding + citations + an out: the three habits that make retrieval answers trustworthy.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "What does retrieval add to a prompt?",
      options: ["A faster model", "Relevant documents found by searching, so Claude can answer from them", "More examples", "A system prompt"],
      answer: 1,
      explain: "Retrieval finds the right information and puts it in front of Claude, so it doesn't have to rely on memory.",
    },
    {
      q: "The documents don't answer the user's question. What should a good retrieval prompt make Claude do?",
      options: ["Guess based on general knowledge", "Say it doesn't have that information", "Pick the closest document and answer from it", "Ask for a different question"],
      answer: 1,
      explain: "An explicit out keeps Claude from filling the gap with plausible-sounding guesses.",
    },
  ],
};

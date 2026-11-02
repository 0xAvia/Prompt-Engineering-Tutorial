import { ANIMAL_WORDS, contains, containsAny, doesNotHardcode, matches, usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter, Criterion } from "../types";

const DOG_TEMPLATE = "Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx";

const SENTENCES = `- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs`;

const tagsAround = (name: string): Criterion =>
  matches(new RegExp(`<([A-Za-z_][\\w-]*)>\\s*\\{${name}\\}\\s*</\\1>`), `Your prompt wraps {${name}} in a pair of XML tags, like <tag>{${name}}</tag>`);

export const ch04: Chapter = {
  id: "separating-data-and-instructions",
  number: "4",
  title: "Separating Data from Instructions",
  level: "intermediate",
  summary: "Reusable prompt templates, and XML tags that show Claude where your data starts and ends.",
  minutes: 20,
  goals: [
    "Turn a one-off prompt into a reusable template with {PLACEHOLDERS}",
    "Use XML tags to separate data from instructions",
    "Spot how small details and typos in a prompt change the result",
  ],
  sections: [
    {
      id: "templates",
      title: "Prompt templates",
      blocks: [
        {
          kind: "text",
          md: md`
            Often you want Claude to do **the same task over and over with different input**: summarize *this* email,
            translate *this* sentence, review *this* code. Instead of rewriting the prompt each time, you write a
            **[template](#g/template)**: a fixed set of instructions with a blank where the data goes.

            In this course, blanks are written in curly braces like \`{ANIMAL}\`. Before the prompt is sent, each blank is
            replaced by its value. Change the value in **Fill in the blanks** below and run it again. The instructions
            stay the same; only the data changes.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "4-animal",
            title: "An animal-noise template",
            prompt: {
              user: "I will tell you the name of an animal. Please respond with the noise that animal makes. {ANIMAL}",
              variables: { ANIMAL: "Cow" },
            },
          },
        },
        {
          kind: "callout",
          tone: "note",
          md: md`
            This is how most apps built on Claude work. The developer writes the template once; users only fill in the
            blanks (often without ever seeing the full prompt). A template can have as many placeholders as you like. Give them
            clear names like \`{CUSTOMER_EMAIL}\` so the template is easy to read.
          `,
        },
      ],
    },
    {
      id: "xml-tags",
      title: "Show Claude where the data is",
      blocks: [
        {
          kind: "text",
          md: md`
            Once data is substituted into a template, **the boundary between instructions and data can disappear**. To you,
            the template below is obvious. But after substitution, does “Yo Claude.” belong to the email Claude should
            rewrite, or is it a greeting to Claude? Open **Preview what Claude actually receives** to see the problem.
          `,
        },
        {
          kind: "compare",
          before: {
            id: "4-email-plain",
            prompt: {
              user: "Yo Claude. {EMAIL} <----- Make this email more polite but don't change anything else about it.",
              variables: { EMAIL: "Show up at 6am tomorrow because I'm the CEO and I say so." },
            },
          },
          after: {
            id: "4-email-tags",
            prompt: {
              user: "Yo Claude. <email>{EMAIL}</email> <----- Make this email more polite but don't change anything else about it.",
              variables: { EMAIL: "Show up at 6am tomorrow because I'm the CEO and I say so." },
            },
          },
          takeaway: "Wrapping the data in `<email>` tags removes the ambiguity. Watch whether the rewrite starts with “Dear Claude”.",
        },
        {
          kind: "text",
          md: md`
            **[XML tags](#g/xml-tags)** are labels in angle brackets. They come in pairs: an opening tag like \`<email>\`
            and a closing tag with a slash like \`</email>\`, wrapped around the content. Claude was trained to pay
            close attention to them, which makes them the best way to mark up a prompt.

            There are no magic tag names. \`<email>\`, \`<document>\`, \`<customer_question>\` all work. Pick names that
            describe the content.

            Here's another case. The instructions include a line that *looks* like part of the list. Without tags,
            which item is “second”?
          `,
        },
        {
          kind: "compare",
          before: {
            id: "4-sentences-plain",
            prompt: {
              user: "Below is a list of sentences. Tell me the second item on the list.\n- Each is about an animal, like rabbits.\n{SENTENCES}",
              variables: { SENTENCES },
            },
          },
          after: {
            id: "4-sentences-tags",
            prompt: {
              user: "Below is a list of sentences. Tell me the second item on the list.\n- Each is about an animal, like rabbits.\n<sentences>\n{SENTENCES}\n</sentences>",
              variables: { SENTENCES },
            },
          },
          takeaway: "The tags tell Claude exactly which lines are the list. (The intended answer is the sentence about spiders.)",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Small details matter",
          md: md`
            Notice the stray hyphen before “Each is about an animal” in the example above? Tiny details like that
            change how Claude reads a prompt. Claude picks up on patterns: it tends to be sloppier with sloppy prompts
            and sharper with clear ones. It's always worth proofreading your prompts for typos and confusing formatting.
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
            id: "4.1",
            title: "A haiku template",
            goal: md`
              Write a **template** that asks for a haiku about \`{TOPIC}\`. The value of \`{TOPIC}\` is fixed to
              “Pigs”, so don't type “pigs” yourself: use the placeholder. A good template would work for any topic.
            `,
            start: { user: "", variables: { TOPIC: "Pigs" } },
            editable: ["user"],
            promptCriteria: [usesVariable("TOPIC"), doesNotHardcode("pig", "Your prompt doesn't type “pig” directly (let {TOPIC} do it)")],
            criteria: [containsAny(ANIMAL_WORDS.pig, { label: "Claude's poem is about pigs" })],
            hints: [
              "Type the placeholder exactly as `{TOPIC}`: curly braces, capital letters. When you do, a “Fill in the blanks” box appears showing its value.",
              "Something like “Write a haiku about {TOPIC}.” is all it takes.",
            ],
            solution: { user: "Write a haiku about {TOPIC}.", variables: { TOPIC: "Pigs" } },
            takeaway: "That's a reusable template: change the value of {TOPIC} and the same prompt writes about anything.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "4.2",
            title: "The messy dog question",
            goal: md`
              This prompt is deliberately messy: typos and random letters everywhere. The real question (“are dogs
              brown?” in shorthand) is in \`{QUESTION}\`. **Add XML tags** so Claude can find the question and answer it.
              Try not to change anything else.
            `,
            start: { user: DOG_TEMPLATE, variables: { QUESTION: "ar cn brown?" } },
            editable: ["user"],
            promptCriteria: [usesVariable("QUESTION"), tagsAround("QUESTION")],
            criteria: [contains("brown", { label: "Claude's answer talks about brown (dogs)" })],
            hints: [
              "Wrap the placeholder in a pair of tags, for example `<question>{QUESTION}</question>`.",
              "Open “Preview what Claude actually receives” to see the substituted prompt with your tags around the question.",
            ],
            solution: {
              user: "Hia its me i have a q about dogs jkaerjv <question>{QUESTION}</question> jklmvca tx it help me muhch much atx fst fst answer short short tx",
              variables: { QUESTION: "ar cn brown?" },
            },
            takeaway: "Even in a messy prompt, tags make it obvious which part is the data Claude should focus on.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "4.3",
            title: "The messy dog question, part 2",
            goal: md`
              Same prompt, different fix: **no XML tags allowed**. Instead, **remove one or two words** so Claude
              understands the question. This shows just how much (or how little) Claude needs to understand you.
            `,
            start: { user: DOG_TEMPLATE, variables: { QUESTION: "ar cn brown?" } },
            editable: ["user"],
            promptCriteria: [
              usesVariable("QUESTION"),
              { label: "No XML tags in your prompt", test: (t) => !/<\/?[A-Za-z_][\w-]*>/.test(t) },
              { label: "You only removed a little (no rewriting the whole thing)", test: (t) => t.length >= DOG_TEMPLATE.length - 25 },
            ],
            criteria: [contains("brown", { label: "Claude's answer talks about brown (dogs)" })],
            hints: [
              "Which “words” are pure noise and sit right next to the question?",
              "Try deleting the random strings `jkaerjv` and `jklmvca` on either side of `{QUESTION}`.",
            ],
            solution: {
              user: "Hia its me i have a q about dogs {QUESTION} tx it help me muhch much atx fst fst answer short short tx",
              variables: { QUESTION: "ar cn brown?" },
            },
            takeaway: "Claude can read through a lot of mess, but noise right next to your key content is what trips it up.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "What's a prompt template?",
      options: [
        "A prompt someone else wrote",
        "A prompt with placeholders that get filled with different data each time",
        "A system prompt",
        "A prompt in a special file format",
      ],
      answer: 1,
      explain: "Templates keep the instructions fixed and swap in new data, which is perfect for repetitive tasks.",
    },
    {
      q: "Why wrap data in XML tags like `<email>…</email>`?",
      options: [
        "Claude only reads text inside tags",
        "It makes the prompt shorter",
        "It shows Claude exactly where the data starts and ends, separate from your instructions",
        "Tags are required by the API",
      ],
      answer: 2,
      explain: "Tags remove ambiguity between instructions and data, especially after substitution.",
    },
    {
      q: "Which tag names does Claude understand best?",
      options: ["Only <data> and <instructions>", "Only official Anthropic tag names", "Any descriptive name: there are no magic tags", "Tags must be numbered"],
      answer: 2,
      explain: "There are no special tag names. Choose names that describe the content, like <contract> or <customer_review>.",
    },
  ],
};

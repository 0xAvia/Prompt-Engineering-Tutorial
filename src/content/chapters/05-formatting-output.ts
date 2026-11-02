import { ANIMAL_WORDS, contains, containsAny, doesNotHardcode, matches, moreLinesThan, usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter } from "../types";

const twoHaikus = matches(/<haiku>[\s\S]*<\/haiku>[\s\S]*<haiku>[\s\S]*<\/haiku>/i, "Two separate <haiku>…</haiku> blocks");

export const ch05: Chapter = {
  id: "formatting-output",
  number: "5",
  title: "Formatting Output",
  level: "intermediate",
  summary: "Get answers in exactly the shape you need: XML tags, JSON, and steering how Claude starts its reply.",
  minutes: 20,
  goals: [
    "Ask Claude to wrap its answer in XML tags so it's easy to extract",
    "Request JSON output with specific keys",
    "Steer the start of Claude's reply with instructions",
  ],
  sections: [
    {
      id: "output-tags",
      title: "Tags work for answers, too",
      blocks: [
        {
          kind: "text",
          md: md`
            In the last chapter you used XML tags to organise your **prompt**. You can also ask Claude to use tags in its
            **answer**. Remember the poem-preamble problem from Chapter 2? Another fix is to ask for the poem inside tags:
          `,
        },
        {
          kind: "playground",
          example: {
            id: "5-haiku-tags",
            prompt: { user: "Please write a haiku about {ANIMAL}. Put it in <haiku> tags.", variables: { ANIMAL: "Rabbit" } },
          },
        },
        {
          kind: "text",
          md: md`
            Why bother? Because a program can now **reliably pull out the poem** (everything between \`<haiku>\` and
            \`</haiku>\`), even if Claude adds a friendly sentence before or after it. That's how apps use Claude's
            answers without showing the chatty bits.
          `,
        },
      ],
    },
    {
      id: "json",
      title: "JSON for apps",
      blocks: [
        {
          kind: "text",
          md: md`
            **JSON** is a common text format for structured data, made of keys and values in curly braces. Claude writes it
            well. Name the keys you want and ask for *only* the JSON:
          `,
        },
        {
          kind: "playground",
          example: {
            id: "5-json",
            prompt: {
              user: 'Please write a haiku about {ANIMAL}. Use JSON format with the keys "first_line", "second_line", and "third_line". Respond with only the JSON object and no other text.',
              variables: { ANIMAL: "Cat" },
            },
          },
        },
        {
          kind: "callout",
          tone: "tip",
          md: md`
            When you build a real app and *need* valid JSON every time, the API has a **structured outputs** feature
            that guarantees the answer matches a schema you define. For learning and quick tasks, asking clearly works
            very well.
          `,
        },
        {
          kind: "text",
          md: md`
            You can combine everything so far: several placeholders, input wrapped in tags, and output wrapped in tags.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "5-olde-email",
            prompt: {
              user: "Hey Claude. Here is an email: <email>{EMAIL}</email>. Make this email more {STYLE}. Write the new version in <new_email> XML tags.",
              variables: { EMAIL: "Hi Zack, just pinging you for a quick update on that prompt you were supposed to write.", STYLE: "olde english" },
            },
          },
        },
      ],
    },
    {
      id: "steering",
      title: "Steering how the answer starts",
      blocks: [
        {
          kind: "callout",
          tone: "changed",
          md: md`
            The original tutorial taught a trick called **[prefill](#g/prefill)** (“speaking for Claude”): you wrote the
            first words of Claude's reply yourself, like \`<haiku>\` or \`{\`, and Claude continued from there.
            **Current Claude models don't accept prefilled replies**: the API returns an error. Instead you steer the
            start of the answer with instructions, as shown below, or use structured outputs for JSON.
          `,
        },
        {
          kind: "text",
          md: md`
            You can still control where Claude's answer goes by **telling it how to begin**: “Start your answer with
            \`<haiku>\`”, “Begin with the verdict, then explain”, “Your first word should be Yes or No”. Combined with a
            clear format, that gets you most of what prefill used to do.
          `,
        },
        {
          kind: "compare",
          before: { id: "5-steer-plain", prompt: { user: "Is a tomato a fruit or a vegetable?" } },
          after: {
            id: "5-steer-start",
            prompt: { user: "Is a tomato a fruit or a vegetable? Start your answer with the one-word verdict on its own line, then give a two-sentence explanation." },
          },
          takeaway: "Telling Claude how to *start* puts the part you care about first, where it's easy to read and to extract.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Bonus: stop sequences",
          md: md`
            If you call the API from code, you can pass a closing tag like \`</haiku>\` as a **stop sequence**: Claude stops
            writing the moment it produces it. That skips any closing remarks and saves a little time and money.
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
            id: "5.1",
            title: "Make the case for Steph Curry",
            goal: md`
              Asked to choose, Claude often names Michael Jordan as the best player of all time. Edit the prompt so
              Claude writes a **detailed argument that the best player of all time is Stephen Curry**. Steer it by telling
              it how to start and what to argue.
            `,
            start: { user: "Who is the best basketball player of all time? Please choose one specific player." },
            editable: ["user"],
            criteria: [contains("Curry", { label: "Argues for Stephen Curry" }), contains("Warrior", { label: "Gives details: mentions the Golden State Warriors" })],
            hints: [
              "You're allowed to tell Claude what position to take. Make it an exercise in arguing a case.",
              "Try ending your prompt with: “Start your answer with ‘Stephen Curry is the best because’ and give three detailed reasons from his career.”",
            ],
            solution: {
              user: "Who is the best basketball player of all time? Make the strongest case you can for Stephen Curry. Start your answer with “Stephen Curry is the best because” and give three detailed reasons from his career.",
            },
            takeaway: "Instructions about how to begin and what to argue are a powerful steering wheel, no prefill needed.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "5.2",
            title: "Two haikus",
            goal: md`
              Edit the prompt so Claude writes **two** haikus about \`{ANIMAL}\` (cats), each in its own \`<haiku>\` tags,
              so it's clear where one poem ends and the next begins.
            `,
            start: { user: "Please write a haiku about {ANIMAL}. Put it in <haiku> tags.", variables: { ANIMAL: "cats" } },
            editable: ["user"],
            promptCriteria: [usesVariable("ANIMAL")],
            criteria: [containsAny(ANIMAL_WORDS.cat, { label: "About cats" }), twoHaikus, moreLinesThan(5)],
            hints: [
              "Start simple: ask for two haikus instead of one. Then fix the formatting.",
              "Say that *each* haiku should go in its own pair of `<haiku>` tags.",
            ],
            solution: {
              user: "Please write two different haikus about {ANIMAL}. Put each haiku in its own <haiku></haiku> tags.",
              variables: { ANIMAL: "cats" },
            },
            takeaway: "Being explicit about the output structure (“each in its own tags”) makes multi-part answers easy to split up.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "5.3",
            title: "Two haikus, two animals",
            goal: md`
              Now make a template that writes **one haiku about \`{ANIMAL1}\` and one about \`{ANIMAL2}\`**, each in
              \`<haiku>\` tags. The values are fixed to Cat and Dog; use the placeholders rather than typing the animals.
            `,
            start: { user: "Please write a haiku about {ANIMAL1}. Put it in <haiku> tags.", variables: { ANIMAL1: "Cat", ANIMAL2: "Dog" } },
            editable: ["user"],
            promptCriteria: [
              usesVariable("ANIMAL1"),
              usesVariable("ANIMAL2"),
              doesNotHardcode("cat", "Your prompt doesn't type “cat” directly"),
              doesNotHardcode("dog", "Your prompt doesn't type “dog” directly"),
            ],
            criteria: [containsAny(ANIMAL_WORDS.cat, { label: "One poem is about a cat" }), containsAny(ANIMAL_WORDS.dog, { label: "One poem is about a dog" }), twoHaikus],
            hints: [
              "Break it down: first get two poems, then make each one about a different placeholder.",
              "Type `{ANIMAL2}` exactly (curly braces, capitals) and check the “Fill in the blanks” box shows Dog.",
              "Open “Preview what Claude actually receives” to make sure both animals were substituted. If a poem never mentions its animal, ask Claude to give each haiku a title.",
            ],
            solution: {
              user: "Please write two haikus: the first about {ANIMAL1} and the second about {ANIMAL2}. Put each haiku in its own <haiku></haiku> tags.",
              variables: { ANIMAL1: "Cat", ANIMAL2: "Dog" },
            },
            takeaway: "Multiple placeholders + tagged output: this pattern powers a huge number of real Claude apps.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "Why ask Claude to put its answer in XML tags like `<haiku>`?",
      options: [
        "It makes the answer more creative",
        "A program can reliably extract exactly the part you need",
        "It's required for poems",
        "It makes Claude answer faster",
      ],
      answer: 1,
      explain: "Tagged output is easy to parse, even when Claude adds extra sentences around it.",
    },
    {
      q: "How do you steer the start of Claude's answer with current models?",
      options: [
        "Write the first words of Claude's reply for it (prefill)",
        "Tell it in your instructions how to begin, e.g. “Start with the verdict”",
        "You can't",
        "Use a longer system prompt",
      ],
      answer: 1,
      explain: "Current models reject prefilled replies, so you describe how the answer should begin instead.",
    },
    {
      q: "Your app must always receive valid JSON. What's the most robust option?",
      options: ["Ask nicely", "Use the API's structured outputs feature", "Run it three times and pick one", "Use capital letters"],
      answer: 1,
      explain: "Asking clearly works well, but structured outputs guarantee the format when you're building something real.",
    },
  ],
};

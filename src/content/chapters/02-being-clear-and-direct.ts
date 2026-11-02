import { contains, exactly, minWords } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter } from "../types";

export const ch02: Chapter = {
  id: "being-clear-and-direct",
  number: "2",
  title: "Being Clear and Direct",
  level: "beginner",
  summary: "The single most useful habit: say exactly what you want, as if briefing a smart new colleague.",
  minutes: 15,
  goals: [
    "Apply the “golden rule” of clear prompting",
    "Explain the reason behind an instruction, so Claude can generalize it",
    "Remove unwanted preambles and get decisive answers just by asking",
    "Control the language, length and format of Claude's reply",
  ],
  sections: [
    {
      id: "golden-rule",
      title: "Claude only knows what you tell it",
      blocks: [
        {
          kind: "text",
          md: md`
            Imagine a brilliant new colleague on their very first day. They're smart and eager, but they have **no context**
            about your project, your preferences or what “good” looks like to you. The more clearly you explain the task,
            the better their work will be.

            Claude is the same. It can't read your mind, so vague prompts get generic answers. The fix is usually not a
            clever trick. It's simply **saying exactly what you want**.
          `,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The golden rule of clear prompting",
          md: md`
            Show your prompt to a friend and ask them to follow it. **If they'd be confused, Claude will be too.**
            If they'd have to ask a follow-up question, put the answer in the prompt.
          `,
        },
      ],
    },
    {
      id: "just-ask",
      title: "Want something? Ask for it",
      blocks: [
        {
          kind: "text",
          md: md`
            Let's ask for a short poem. Claude often wraps its answer in a friendly intro like “Here's a haiku about…”.
            That's fine in a chat, but annoying if you want to paste the poem straight into an app.

            How do you get rid of the intro? **You ask.**
          `,
        },
        {
          kind: "compare",
          before: { id: "2-haiku-plain", prompt: { user: "Write a haiku about robots." } },
          after: { id: "2-haiku-direct", prompt: { user: "Write a haiku about robots. Skip the preamble; go straight into the poem." } },
          takeaway: "One extra sentence, and the answer is exactly the shape you wanted.",
        },
        {
          kind: "text",
          md: md`
            Here's another one. Ask who the best basketball player of all time is, and Claude will usually give you a
            balanced answer listing several players. Sometimes that's what you want. But if you need **one** name, say so,
            and tell Claude you know it's a matter of opinion.
          `,
        },
        {
          kind: "compare",
          before: { id: "2-goat-plain", prompt: { user: "Who is the best basketball player of all time?" } },
          after: {
            id: "2-goat-direct",
            prompt: {
              user: "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?",
            },
          },
          takeaway: "Claude hedges when the request is open-ended. Remove the ambiguity, and it commits.",
        },
      ],
    },
    {
      id: "be-specific",
      title: "Be specific about the details",
      blocks: [
        {
          kind: "text",
          md: md`
            Clear prompts usually spell out a few of these:

            | Say… | Instead of… |
            |---|---|
            | **What** you want: “a 3-bullet summary” | “summarize this” |
            | **Who** it's for: “for a 10-year-old” | (nothing) |
            | **How long**: “under 50 words” | “short” |
            | **What format**: “a numbered list”, “plain text, no markdown” | (hoping for the best) |
            | **What to avoid**: “don't mention pricing” | (being surprised later) |

            Try it: make this prompt more specific and see how much the answer improves.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "2-specific",
            title: "Your turn: make it specific",
            note: "Add details: an audience, a length, a format. Run it after each change.",
            prompt: { user: "Explain photosynthesis." },
          },
        },
      ],
    },
    {
      id: "explain-why",
      title: "Explain why",
      blocks: [
        {
          kind: "text",
          md: md`
            A rule on its own tells Claude *what*. Adding the reason tells it *why*, and Claude can then apply the idea
            to situations your rule didn't mention.

            Below, both prompts ban ellipses (“…”), and the second explains why: the text will be read aloud by a
            text-to-speech engine. The story asks for lots of dramatic pauses and sound effects, exactly what ellipses
            are usually used for. Run both and compare how each one writes those pauses: does the first just swap the
            ellipses for dashes or other symbols a speech engine would stumble over too?
          `,
        },
        {
          kind: "compare",
          before: {
            id: "2-why-plain",
            prompt: { system: "Never use ellipses.", user: "Write the opening of a spooky bedtime story about an old lighthouse, in about 80 words, with lots of dramatic pauses and sound effects." },
          },
          after: {
            id: "2-why-reason",
            prompt: {
              system:
                "Your response will be read aloud by a text-to-speech engine, so never use ellipses, since the engine doesn't know how to pronounce them.",
              user: "Write the opening of a spooky bedtime story about an old lighthouse, in about 80 words, with lots of dramatic pauses and sound effects.",
            },
          },
          takeaway:
            "The rule only bans one symbol. The reason tells Claude the real goal (text that sounds right when read aloud), so it can handle cases the rule never mentioned. One sentence of “because…” often replaces a whole list of extra rules.",
        },
      ],
    },
    {
      id: "critique",
      title: "Let Claude be your colleague",
      blocks: [
        {
          kind: "text",
          md: md`
            Remember the golden rule: show your prompt to a colleague. Claude can be that colleague. Paste a prompt you're
            working on and ask what's unclear. It's a fast way to find the questions a reader would have.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "2-critique",
            title: "Ask Claude to review a prompt",
            note: "Replace the draft inside the tags with any prompt of your own.",
            prompt: {
              user: `Here is a prompt I've written for an AI assistant:

<draft_prompt>
Write a summary of the meeting notes for the team.
</draft_prompt>

Imagine you're a smart new colleague receiving these instructions with no other context. List the questions you'd need answered to do a great job, then suggest an improved version of the prompt.`,
            },
          },
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
            id: "2.1",
            title: "Hola!",
            goal: "Edit the **system prompt** so Claude answers in **Spanish**.",
            start: { system: "", user: "Hello Claude, how are you?" },
            editable: ["system"],
            criteria: [contains("hola", { label: "Answer includes “hola”" })],
            hints: [
              "How would you ask a person to reply in Spanish? Ask Claude the same way.",
              "Something like “Always reply in Spanish.” in the system prompt is enough.",
            ],
            solution: { system: "Always reply in Spanish, no matter what language the user writes in.", user: "Hello Claude, how are you?" },
            takeaway: "A single clear instruction in the system prompt changed every reply.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "2.2",
            title: "One player only",
            goal: md`
              Write a prompt that makes Claude reply with **only** the name **Michael Jordan**: no other words, no
              explanation, not even a full stop.
            `,
            start: { user: "Who is the best basketball player of all time?" },
            editable: ["user"],
            criteria: [exactly("Michael Jordan", { label: "Answer is exactly “Michael Jordan”, with nothing else" })],
            hints: [
              "Two things are needed: get Claude to commit to one player, and get it to reply with *only* the name.",
              "Try phrases like “Reply with only the player's full name and nothing else: no punctuation, no explanation.”",
              "If Claude picks someone else, you're allowed to steer it: for example, ask who has the most NBA Finals MVP awards.",
            ],
            solution: {
              user: "Who is the best basketball player of all time? There are differing opinions, but if you had to pick one, who would it be? Reply with only the player's full name: no other words and no punctuation.",
            },
            takeaway: "Exact-output instructions matter a lot when a program, not a person, reads Claude's reply.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "2.3",
            title: "Write a long story",
            goal: "Get Claude to write a story of **at least 800 words**.",
            start: { user: "", maxTokens: 8000 },
            editable: ["user"],
            criteria: [minWords(800)],
            wordCounter: true,
            hints: [
              "Ask for a story and say how long it should be.",
              "Language models are bad at counting words. Aim higher than you need, say 1,200 words, or ask for several chapters.",
            ],
            solution: {
              user: "Write a 1,200-word short story about a lighthouse keeper who finds a message in a bottle. Give it a beginning, middle and end, with plenty of dialogue and description.",
              maxTokens: 8000,
            },
            takeaway: "When you need a certain length, ask for it explicitly, and overshoot a little because Claude estimates rather than counts.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "Which instruction is likely to work best?",
      options: [
        "“NEVER use ellipses!!!”",
        "“Never use ellipses.”",
        "“This will be read aloud by a text-to-speech engine, so never use ellipses, since it can't pronounce them.”",
        "“Don't use ellipses or else.”",
      ],
      answer: 2,
      explain: "Giving the reason lets Claude apply the idea more widely, like also avoiding other symbols a speech engine can't read.",
    },
    {
      q: "What's the “golden rule” of clear prompting?",
      options: [
        "Always use as few words as possible",
        "If a friend would be confused by your prompt, Claude will be too",
        "Always write prompts in capital letters for emphasis",
        "Start every prompt with “please”",
      ],
      answer: 1,
      explain: "Claude has no context beyond your prompt. If a smart person couldn't follow it without asking questions, add the missing details.",
    },
    {
      q: "Claude starts its poem with “Here's a haiku about…”, which you don't want. What's the simplest fix?",
      options: ["Use a bigger model", "Ask it to skip the preamble and go straight into the poem", "Run it again until it stops", "Delete the first line yourself every time"],
      answer: 1,
      explain: "Most of the time you can get what you want by simply asking for it.",
    },
    {
      q: "You need a reply of about 1,000 words. What's the best approach?",
      options: ["Ask for “a long answer”", "Ask for a specific length, aiming a bit higher than you need", "Increase the font size", "Ask several times and combine the answers"],
      answer: 1,
      explain: "Be specific about length. Models estimate rather than count words, so overshooting your target is a good habit.",
    },
  ],
};

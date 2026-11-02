import { contains, containsAny } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter } from "../types";

export const ch01: Chapter = {
  id: "basic-prompt-structure",
  number: "1",
  title: "Basic Prompt Structure",
  level: "beginner",
  summary: "What a prompt actually is: messages, turns, and the system prompt that sets the ground rules.",
  minutes: 15,
  goals: [
    "Explain the difference between your turns, Claude's turns and the system prompt",
    "Run your first prompts and read Claude's answers",
    "Use a system prompt to change how Claude responds",
  ],
  sections: [
    {
      id: "conversation",
      title: "A prompt is a conversation",
      blocks: [
        {
          kind: "text",
          md: md`
            When you chat with Claude on claude.ai, you type a message and Claude replies. Behind the scenes, and in
            every app built on Claude, the same thing happens: your [prompt](#g/prompt) is sent as a **conversation**, a list
            of messages that take turns between two roles:

            - the **user**: that's you (or the app you're building), and
            - the **assistant**: that's Claude.

            On top of the conversation there's an optional third ingredient, the **[system prompt](#g/system-prompt)**: a set of
            ground rules Claude keeps in mind for every reply.

            Click through the parts below to see how a request is put together.
          `,
        },
        { kind: "custom", component: "message-anatomy" },
      ],
    },
    {
      id: "first-prompts",
      title: "Your first prompts",
      blocks: [
        {
          kind: "text",
          md: md`
            Every example in this course is a live **playground**. Press **Run** to send the prompt to Claude and watch the
            answer appear. Then change the prompt and run it again. Nothing breaks, and **Reset** puts it back.
          `,
        },
        {
          kind: "playground",
          example: { id: "1-hello", title: "Say hello", prompt: { user: "Hi Claude, how are you?" } },
        },
        {
          kind: "playground",
          example: { id: "1-ocean", title: "Ask a question", prompt: { user: "Can you tell me the color of the ocean?" } },
        },
        {
          kind: "playground",
          example: { id: "1-celine", title: "Ask for a fact", prompt: { user: "What year was Celine Dion born in?" } },
        },
        {
          kind: "callout",
          tone: "tip",
          md: md`
            Claude's answers vary a little each time, even for the same prompt. Try pressing **Run again** a couple of times
            and compare.
          `,
        },
      ],
    },
    {
      id: "turns",
      title: "Conversations follow two rules",
      blocks: [
        {
          kind: "text",
          md: md`
            You can send Claude more than one message at a time, for example to continue an earlier conversation. You can even
            *write Claude's earlier replies yourself*: Claude treats them as things it already said. Just follow two rules:

            1. **The conversation starts with a user turn.**
            2. **User and assistant turns alternate.** Never two user turns (or two assistant turns) in a row.

            If you break a rule, Anthropic's [API](#g/api) rejects the request with an error. (This page checks the rules for you
            before sending.)

            Here's a conversation with an earlier exchange already filled in. Notice that Claude knows who "her" refers to,
            because it can see the whole conversation.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "1-multiturn",
            title: "A conversation with history",
            prompt: {
              history: [
                { role: "user", content: "What year was Celine Dion born in?" },
                { role: "assistant", content: "Celine Dion was born in 1968." },
              ],
              user: "Also, can you tell me some other facts about her?",
            },
          },
        },
        {
          kind: "callout",
          tone: "note",
          md: md`
            Claude doesn't remember anything between requests. Each request has to include the **whole** conversation so far.
            Chat apps do this for you behind the scenes, which is why long chats get slower and more expensive.
          `,
        },
      ],
    },
    {
      id: "system-prompts",
      title: "System prompts set the ground rules",
      blocks: [
        {
          kind: "text",
          md: md`
            A **system prompt** sits above the conversation. Use it to give Claude context, instructions and guidelines
            that apply to the whole chat: who it should act as, the tone to use, the rules to follow.

            Compare the same question with and without a system prompt:
          `,
        },
        {
          kind: "compare",
          before: {
            id: "1-sky-plain",
            title: "No system prompt",
            prompt: { user: "Why is the sky blue?" },
          },
          after: {
            id: "1-sky-system",
            title: "With a system prompt",
            prompt: {
              system:
                "Your answer should always be a series of critical thinking questions that further the conversation (do not provide answers to your questions). Do not actually answer the user question.",
              user: "Why is the sky blue?",
            },
          },
          takeaway:
            "Same question, completely different answer. A well-written system prompt is one of the most reliable ways to shape how Claude behaves.",
        },
      ],
    },
    {
      id: "iterate",
      title: "How prompt engineers work",
      blocks: [
        {
          kind: "text",
          md: md`
            Prompt engineering isn't about magic words. It's a simple loop, and you'll use it in every exercise:

            1. **Decide what “good” looks like** before you start. “Counts to three using digits” is testable;
               “a nice answer” isn't.
            2. **Try it on a few different inputs**, including awkward ones. A prompt that works once can fail on the
               next message.
            3. **Change one thing at a time** and run it again, so you know what helped.

            The exercises in this course do steps 1 and 2 for you: each one has a checker that knows what good looks
            like, and some run your prompt on several inputs at once. In the appendix you'll learn to build your own.
          `,
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
            Time to write your own prompts. Each exercise is checked automatically: when Claude's answer meets the goal,
            you'll see a ✅. Stuck? Open a hint.
          `,
        },
        {
          kind: "exercise",
          exercise: {
            id: "1.1",
            title: "Counting to three",
            goal: "Write a prompt that gets Claude to **count to three**.",
            start: { user: "" },
            editable: ["user"],
            criteria: [contains("1", { label: "Answer includes the digit 1" }), contains("2", { label: "Answer includes the digit 2" }), contains("3", { label: "Answer includes the digit 3" })],
            hints: [
              "Often you can get Claude to do what you want just by asking for it.",
              "The checker looks for the digits **1**, **2** and **3**. If Claude writes “one, two, three”, ask it to use numerals.",
            ],
            solution: { user: "Count from 1 to 3, using digits." },
            takeaway: "Simple, direct requests work. You'll see in the next chapter how being specific (“using digits”) makes results more reliable.",
          },
        },
        {
          kind: "exercise",
          exercise: {
            id: "1.2",
            title: "Talk like a three-year-old",
            goal: md`
              The question stays the same. Edit the **system prompt** so Claude answers like it's a **three-year-old child**.
            `,
            start: { system: "", user: "How big is the sky?" },
            editable: ["system"],
            criteria: [containsAny(["giggle", "soo"], { label: "Sounds like a toddler: giggling or a stretched-out “soooo”" })],
            hints: [
              "Tell Claude *who* it is in the system prompt, like you'd brief an actor.",
              "The checker looks for a giggle or a stretched-out “soooo”. Toddlers do both a lot. You could mention that in your system prompt.",
            ],
            solution: {
              system: "You are a three-year-old child. Talk like a toddler: use very simple words, stretch out words like “soooo big”, and giggle a lot.",
              user: "How big is the sky?",
            },
            takeaway: "The system prompt changed *how* Claude answers without touching the question itself. That separation is very handy when building apps.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "Which turn must every conversation with Claude start with?",
      options: ["A user turn", "An assistant turn", "The system prompt", "It can start with either"],
      answer: 0,
      explain: "Conversations always begin with a user turn. The system prompt isn't a turn at all: it sits separately, above the conversation.",
    },
    {
      q: "You send two user messages in a row. What happens?",
      options: ["Claude answers both", "Claude answers only the last one", "The request is rejected: turns must alternate", "Claude merges them"],
      answer: 2,
      explain: "User and assistant turns must alternate. Combine the two messages into one user turn instead.",
    },
    {
      q: "What is a system prompt best used for?",
      options: [
        "Storing your API key",
        "Setting context and rules that apply to the whole conversation",
        "Making Claude answer faster",
        "Writing Claude's reply for it",
      ],
      answer: 1,
      explain: "The system prompt gives Claude context, instructions and guidelines that hold for every reply in the conversation.",
    },
    {
      q: "Does Claude remember your previous requests automatically?",
      options: ["Yes, forever", "Yes, for 24 hours", "No: each request must include the conversation so far"],
      answer: 2,
      explain: "Every request is independent. To continue a conversation, you send the earlier turns along with the new message.",
    },
  ],
};

import { containsAny } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter } from "../types";

const MATH = `Is this equation solved correctly below?

2x - 3 = 9
2x = 6
x = 3`;

const GYM = "I'm about to sign up for a one-year gym membership that renews automatically. Is there anything I should check first?";

export const ch03: Chapter = {
  id: "assigning-roles",
  number: "3",
  title: "Assigning Roles",
  level: "beginner",
  summary: "Give Claude a role (an expert, a character, a reviewer) to change its tone, focus and even its accuracy.",
  minutes: 12,
  goals: [
    "Use role prompting to change Claude's voice and perspective",
    "Add audience context to make answers land",
    "Use an expert role to change what Claude focuses on",
  ],
  sections: [
    {
      id: "roles",
      title: "Tell Claude who to be",
      blocks: [
        {
          kind: "text",
          md: md`
            Claude has no context beyond what you give it, and that includes *who it's supposed to be*. Giving it a role
            (“You are a patient maths tutor”, “You are a strict copy editor”) is called **role prompting**, and it
            changes a lot:

            - the **tone and style** of the answer,
            - what Claude **pays attention to**,
            - and, for many tasks, **how well it performs**.

            You can put the role in the [system prompt](#g/system-prompt) (most common) or at the start of your message.
            Here's the same question with and without a role:
          `,
        },
        {
          kind: "compare",
          before: { id: "3-skate-plain", prompt: { user: "In one sentence, what do you think about skateboarding?" } },
          after: { id: "3-skate-cat", prompt: { system: "You are a cat.", user: "In one sentence, what do you think about skateboarding?" } },
          takeaway: "Three words of system prompt, and the whole perspective changes.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Bonus: say who the audience is",
          md: md`
            “You are a cat” and “You are a cat talking to a crowd of skateboarders” produce quite different answers.
            Telling Claude **who it's talking to** is one of the easiest ways to get the right level of detail.
            Try adding an audience to the “After” prompt above.
          `,
        },
      ],
    },
    {
      id: "expert-roles",
      title: "Expert roles change what Claude notices",
      blocks: [
        {
          kind: "text",
          md: md`
            Roles aren't just for fun voices. A role tells Claude **which expertise to bring**, and that changes what
            it pays attention to. Older, smaller models sometimes needed an expert role just to get a tricky question
            right; current models usually manage without one. Today the bigger effect is on **focus and depth**: an
            expert notices details a general answer skims over.

            Run both versions and compare what each answer focuses on.
          `,
        },
        {
          kind: "compare",
          before: { id: "3-role-plain", prompt: { user: GYM } },
          after: {
            id: "3-role-lawyer",
            prompt: { system: "You are a consumer-protection lawyer who reviews contracts for ordinary people.", user: GYM },
          },
          takeaway:
            "Both answers usually cover the basics, like notice periods and fees. The difference is focus: the lawyer turns to your legal rights, keeping proof that you cancelled, and where to complain if the gym won't let you go, while the plain answer spends its space on things like opening hours.",
        },
        {
          kind: "callout",
          tone: "note",
          md: md`
            Throughout this course you'll find **several techniques that solve the same problem**. A role, clearer
            instructions, or giving Claude more effort to think (Chapter 6) can all improve accuracy. Experiment and find
            the style that works for you.
          `,
        },
      ],
    },
    {
      id: "exercises",
      title: "Exercise",
      blocks: [
        {
          kind: "exercise",
          exercise: {
            id: "3.1",
            title: "Catch the maths mistake",
            goal: md`
              The working below contains a mistake in the second step (2x should equal **12**, not 6). Edit the prompt
              and/or system prompt so Claude clearly says the solution is **incorrect**.
            `,
            start: { system: "", user: MATH },
            editable: ["system", "user"],
            criteria: [containsAny(["incorrect", "not correct"], { label: "Says the solution is “incorrect” or “not correct”" })],
            hints: [
              "Give Claude a role that would make it good at checking maths, such as a strict teacher marking homework.",
              "You can also ask it to check each step and finish with a verdict: “correct” or “incorrect”.",
            ],
            solution: {
              system: "You are a meticulous maths teacher grading a student's homework. Check every step carefully.",
              user: `${MATH}\n\nCheck each step, then finish with a one-word verdict: correct or incorrect.`,
            },
            takeaway: "A role plus a clear request for a verdict turns a vague check into a careful one.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "Where can you put a role prompt?",
      options: ["Only in the system prompt", "Only in your message", "In the system prompt or in your message", "Roles can only be set in settings"],
      answer: 2,
      explain: "Both work. The system prompt is the most common place because the role then applies to the whole conversation.",
    },
    {
      q: "Which of these is the most effective role prompt?",
      options: [
        "You are smart.",
        "You are a pediatric nurse explaining a vaccine to a nervous 7-year-old and their parent.",
        "Be a good assistant.",
        "Act normal.",
      ],
      answer: 1,
      explain: "Detailed roles with audience context give Claude much more to work with.",
    },
    {
      q: "Besides tone, what does a good role change?",
      options: ["Response speed", "What Claude focuses on, and how expert the answer is", "The price per token", "Nothing else"],
      answer: 1,
      explain: "A role tells Claude which expertise to bring, so it notices the details that matter for the task.",
    },
  ],
};

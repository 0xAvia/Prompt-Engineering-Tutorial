import { containsAny } from "../../lib/graders";
import { md } from "../../lib/md";
import type { Chapter } from "../types";

const MATH = `Is this equation solved correctly below?

2x - 3 = 9
2x = 6
x = 3`;

const LOGIC =
  "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don't know if Anne is married. Is a married person looking at an unmarried person?";

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
    "Use an expert role to make Claude more careful on tricky tasks",
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
      title: "Expert roles make Claude more careful",
      blocks: [
        {
          kind: "text",
          md: md`
            Roles aren't just for fun voices. Asking Claude to act as an expert can make it slow down and reason more
            carefully. Here's a logic puzzle with a definite answer (it's **yes**: work through both cases for Anne
            to see why).

            Run both versions. Does the role change the answer, the reasoning, or just the tone? Run each a few times:
            smaller models in particular can be swayed by a good role.
          `,
        },
        {
          kind: "compare",
          before: { id: "3-logic-plain", prompt: { user: LOGIC } },
          after: { id: "3-logic-role", prompt: { system: "You are a logic bot designed to answer complex logic problems.", user: LOGIC } },
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
      q: "Besides tone, what can a good role improve?",
      options: ["Response speed", "Accuracy on tasks like maths, logic and reviewing", "The price per token", "Nothing else"],
      answer: 1,
      explain: "Priming Claude with an expert role can make it more careful and accurate, not just change its voice.",
    },
  ],
};

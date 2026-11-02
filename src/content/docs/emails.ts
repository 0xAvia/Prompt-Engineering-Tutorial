import { matches } from "../../lib/graders";
import type { Criterion, TestCase } from "../types";

// The customer emails from the original tutorial's Chapters 6 and 7.
export const EMAILS = [
  {
    label: "Smoky mixer",
    text: "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement.",
    answers: ["B"],
  },
  {
    label: "Mixing paint?",
    text: "Can I use my Mixmaster 4000 to mix paint, or is it only meant for mixing food?",
    answers: ["A", "D"],
  },
  {
    label: "Angry about charges",
    text: "I HAVE BEEN WAITING 4 MONTHS FOR MY MONTHLY CHARGES TO END AFTER CANCELLING!!  WTF IS GOING ON???",
    answers: ["C"],
  },
  {
    label: "Lost customer",
    text: "How did I get here I am not good with computer.  Halp.",
    answers: ["D"],
  },
];

export const CATEGORIES: Record<string, string> = {
  A: "Pre-sale question",
  B: "Broken or defective item",
  C: "Billing question",
  D: "Other (please explain)",
};

export const CATEGORY_LIST = Object.entries(CATEGORIES)
  .map(([k, v]) => `(${k}) ${v}`)
  .join("\n");

const expectedText = (answers: string[]) => answers.map((a) => `(${a}) ${CATEGORIES[a]}`).join(" or ");

/** Build one test case per email, using `criterion` to check the expected letters. */
export function emailCases(criterion: (answers: string[]) => Criterion): TestCase[] {
  return EMAILS.map((e) => ({
    label: e.label,
    variables: { email: e.text },
    expected: expectedText(e.answers),
    criteria: [criterion(e.answers)],
  }));
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "B) B"-style check from the original: letter, closing parenthesis, first letter of the category name. */
export const letterAndName = (answers: string[]) =>
  matches(
    new RegExp(answers.map((a) => `${a}\\) ${esc(CATEGORIES[a][0])}`).join("|")),
    `Says ${answers.map((a) => `“${a}) ${CATEGORIES[a]}”`).join(" or ")}`,
  );

/** Exact <answer>X</answer> tag check. */
export const answerTag = (answers: string[]) =>
  matches(new RegExp(answers.map((a) => `<answer>${a}</answer>`).join("|")), `Contains ${answers.map((a) => `<answer>${a}</answer>`).join(" or ")}`);

/** The answer ends with the category letter. */
export const endsWithLetter = (answers: string[]) =>
  matches(new RegExp(`(${answers.join("|")})[\\s.]*$`), `The very last letter is ${answers.join(" or ")}`);

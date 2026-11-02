import { usesVariable } from "../../lib/graders";
import { md } from "../../lib/md";
import { CATEGORY_LIST, emailCases, endsWithLetter } from "../docs/emails";
import type { Chapter } from "../types";

const EXTRACTION = `Silvermist Hollow, a charming village, was home to an extraordinary group of individuals.
Among them was Dr. Liam Patel, a neurosurgeon who revolutionized surgical techniques at the regional medical center.
Olivia Chen was an innovative architect who transformed the village's landscape with her sustainable and breathtaking designs.
The local theater was graced by the enchanting symphonies of Ethan Kovacs, a professionally-trained musician and composer.
Isabella Torres, a self-taught chef with a passion for locally sourced ingredients, created a culinary sensation with her farm-to-table restaurant, which became a must-visit destination for food lovers.
These remarkable individuals, each with their distinct talents, contributed to the vibrant tapestry of life in Silvermist Hollow.
<individuals>
1. Dr. Liam Patel [NEUROSURGEON]
2. Olivia Chen [ARCHITECT]
3. Ethan Kovacs [MUSICIAN AND COMPOSER]
4. Isabella Torres [CHEF]
</individuals>

At the heart of the town, Chef Oliver Hamilton has transformed the culinary scene with his farm-to-table restaurant, Green Plate. Oliver's dedication to sourcing local, organic ingredients has earned the establishment rave reviews from food critics and locals alike.
Just down the street, you'll find the Riverside Grove Library, where head librarian Elizabeth Chen has worked diligently to create a welcoming and inclusive space for all. Her efforts to expand the library's offerings and establish reading programs for children have had a significant impact on the town's literacy rates.
As you stroll through the charming town square, you'll be captivated by the beautiful murals adorning the walls. These masterpieces are the work of renowned artist, Isabella Torres, whose talent for capturing the essence of Riverside Grove has brought the town to life.
Riverside Grove's athletic achievements are also worth noting, thanks to former Olympic swimmer-turned-coach, Marcus Jenkins. Marcus has used his experience and passion to train the town's youth, leading the Riverside Grove Swim Team to several regional championships.
<individuals>
1. Oliver Hamilton [CHEF]
2. Elizabeth Chen [LIBRARIAN]
3. Isabella Torres [ARTIST]
4. Marcus Jenkins [COACH]
</individuals>

Oak Valley, a charming small town, is home to a remarkable trio of individuals whose skills and dedication have left a lasting impact on the community.
At the town's bustling farmer's market, you'll find Laura Simmons, a passionate organic farmer known for her delicious and sustainably grown produce. Her dedication to promoting healthy eating has inspired the town to embrace a more eco-conscious lifestyle.
In Oak Valley's community center, Kevin Alvarez, a skilled dance instructor, has brought the joy of movement to people of all ages. His inclusive dance classes have fostered a sense of unity and self-expression among residents, enriching the local arts scene.
Lastly, Rachel O'Connor, a tireless volunteer, dedicates her time to various charitable initiatives. Her commitment to improving the lives of others has been instrumental in creating a strong sense of community within Oak Valley.
Through their unique talents and unwavering dedication, Laura, Kevin, and Rachel have woven themselves into the fabric of Oak Valley, helping to create a vibrant and thriving small town.`;

export const ch07: Chapter = {
  id: "few-shot-examples",
  number: "7",
  title: "Using Examples",
  level: "intermediate",
  summary: "Show, don't tell: a few good examples teach Claude the tone and format you want faster than any description.",
  minutes: 15,
  goals: [
    "Explain zero-shot, one-shot and few-shot prompting",
    "Use examples to set tone without describing it",
    "Use examples to get an exact output format",
  ],
  sections: [
    {
      id: "examples",
      title: "Show Claude what you mean",
      blocks: [
        {
          kind: "text",
          md: md`
            Giving Claude **examples of what you want** is one of the most effective techniques there is. It's great for
            getting the right answer, and even better for getting the answer **in the right style and format**.

            This is called **[few-shot prompting](#g/few-shot)**. The “shots” are examples: zero-shot means none,
            one-shot means one, few-shot means a handful.

            Say you're building a bot that answers children's questions on behalf of parents. Claude's default
            answer to a sensitive question can be careful and matter-of-fact, which isn't quite the magic you're after.
            You *could* describe the tone you want… or just show it:
          `,
        },
        {
          kind: "compare",
          before: { id: "7-santa-plain", prompt: { user: "Will Santa bring me presents on Christmas?" } },
          after: {
            id: "7-santa-shots",
            prompt: {
              user: `Please complete the conversation by writing the next line, speaking as "A".
Q: Is the tooth fairy real?
A: Of course, sweetie. Wrap up your tooth and put it under your pillow tonight. There might be something waiting for you in the morning.
Q: Will Santa bring me presents on Christmas?`,
            },
          },
          takeaway: "One example set the tone, warmth and length, without a single word of description.",
        },
      ],
    },
    {
      id: "format",
      title: "Examples nail the format",
      blocks: [
        {
          kind: "text",
          md: md`
            Examples are especially good at formatting. Instead of explaining “list each person, numbered, with their job in
            capitals in square brackets, inside \`<individuals>\` tags”, the prompt below just shows two finished examples
            and lets Claude spot the pattern for the third passage.
          `,
        },
        {
          kind: "playground",
          example: {
            id: "7-extraction",
            title: "Extract people and jobs by example",
            prompt: { user: `${EXTRACTION}\n\nList the individuals in this last passage in the same format.` },
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Tips for good examples",
          md: md`
            - **Wrap each example in tags** like \`<example>\`, so Claude knows where examples start and end.
            - **Vary them.** Cover the tricky cases, not just the easy ones, or Claude will copy quirks you didn't intend.
            - **Match the format exactly.** Claude copies your examples closely, including mistakes.
            - **More is usually better**, up to a point. Three to five good examples is a great start.
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
            id: "7.1",
            title: "Classify emails by example",
            goal: md`
              Back to the four customer emails from Chapter 6. This time, use **examples** to teach Claude the format:
              the **very last letter** of Claude's answer must be the category letter (A–D). Keep \`{email}\` in your prompt.

              Categories: (A) Pre-sale question · (B) Broken or defective item · (C) Billing question · (D) Other (please explain)
            `,
            start: { user: "Please classify this email as either green or blue: {email}" },
            editable: ["user"],
            promptCriteria: [usesVariable("email"), { label: "Your prompt includes at least one example", test: (t) => /example/i.test(t) }],
            cases: emailCases(endsWithLetter),
            hints: [
              "Write two or three short made-up emails and show the exact answer you want for each, e.g. “The correct category is: B”.",
              "Put each example inside `<example>` tags, and keep the category list and the `{email}` placeholder in the prompt.",
              "Format the real email the same way as your examples, so Claude follows the same pattern and ends with the letter.",
            ],
            solution: {
              user: `Please classify emails into the following categories, and do not include explanations:
<categories>
${CATEGORY_LIST}
</categories>

Here are a few examples of correct answer formatting:
<example>
Q: How much does it cost to buy a Mixmaster4000?
A: The correct category is: A
</example>
<example>
Q: My Mixmaster won't turn on.
A: The correct category is: B
</example>
<example>
Q: Please remove me from your mailing list.
A: The correct category is: D
</example>

Here is the email for you to categorize:
Q: {email}

Answer in exactly the same format as the examples.`,
            },
            takeaway: "Examples pinned down the format so precisely that a program can read the answer from the last character.",
          },
        },
      ],
    },
  ],
  quiz: [
    {
      q: "What does “few-shot prompting” mean?",
      options: ["Running a prompt a few times", "Including a few examples of ideal answers in the prompt", "Using a small model", "Keeping prompts short"],
      answer: 1,
      explain: "Each example is a “shot”. Few-shot = a handful of examples.",
    },
    {
      q: "Your examples all happen to be about billing. What's the risk?",
      options: ["None", "Claude may over-focus on billing or copy quirks: examples should be varied", "The API rejects repetitive examples", "Claude ignores examples that are similar"],
      answer: 1,
      explain: "Claude copies patterns closely. Vary your examples and include tricky edge cases.",
    },
    {
      q: "When are examples most useful?",
      options: ["Only for maths", "For setting tone, style and exact output formats", "Only with system prompts", "Never; descriptions are always better"],
      answer: 1,
      explain: "Showing is often faster and more precise than describing, especially for tone and format.",
    },
  ],
};

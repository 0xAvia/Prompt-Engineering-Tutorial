// Data for Appendix 10.1 (chaining prompts).

export interface ChainStep {
  user: string;
  /**
   * "continue": a follow-up in the same conversation.
   * "new": a fresh prompt; {PREVIOUS} is the last step's answer and {STEP1}, {STEP2}… are earlier answers.
   */
  mode: "continue" | "new";
}

export interface Chain {
  title: string;
  description: string;
  steps: ChainStep[];
}

export const CHAINS: Record<string, Chain> = {
  "fix-words": {
    title: "Ask Claude to check its own work",
    description: "Step 1 asks for a tricky list. Step 2 continues the same conversation and asks Claude to fix any mistakes.",
    steps: [
      { user: "Name ten words that all end with the exact letters 'ab'.", mode: "new" },
      { user: "Please find replacements for all 'words' that are not real words. If all the words are real words, return the original list.", mode: "continue" },
    ],
  },
  "self-correct": {
    title: "Draft, review, refine",
    description: "The most common chain: write a draft, have Claude review it against explicit criteria, then rewrite it to fix what the review found.",
    steps: [
      { user: "Write a product description for a reusable water bottle aimed at hikers, in about 80 words.", mode: "new" },
      {
        user: `Review this product description against these criteria:
1. Mentions at least one concrete feature (like capacity, weight or material)
2. Speaks directly to hikers' needs
3. Ends with a clear call to action
4. No more than 80 words

<draft>
{STEP1}
</draft>

For each criterion, say "met" or "not met" with a one-line reason.`,
        mode: "new",
      },
      {
        user: `Rewrite the draft so it meets every criterion the review marked "not met", keeping what already works. Reply with only the new description.

<draft>
{STEP1}
</draft>

<review>
{STEP2}
</review>`,
        mode: "new",
      },
    ],
  },
  "names-pipeline": {
    title: "A two-step pipeline",
    description: "Step 1 extracts data. Step 2 is a brand-new prompt that receives step 1's output in {PREVIOUS}.",
    steps: [
      {
        user: `Find all names from the below text. Put them in <names> tags, one per line, and write nothing else.

"Hey, Jesse. It's me, Erin. I'm calling about the party that Joey is throwing tomorrow. Keisha said she would come and I think Mel will be there too."`,
        mode: "new",
      },
      { user: "Alphabetize this list of names. Reply with only the list.\n\n{PREVIOUS}", mode: "new" },
    ],
  },
};

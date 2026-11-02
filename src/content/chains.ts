// Data for Appendix 10.1 (chaining prompts).

export interface ChainStep {
  user: string;
  /** "continue": a follow-up in the same conversation. "new": a fresh prompt with {PREVIOUS} filled in. */
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
  "improve-story": {
    title: "Draft, then improve",
    description: "Writing is rewriting. Step 2 asks Claude to improve its own first draft.",
    steps: [
      { user: "Write a three-sentence short story about a girl who likes to run.", mode: "new" },
      { user: "Make the story better.", mode: "continue" },
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

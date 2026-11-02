// Plain-English definitions for jargon. Link from lesson markdown with
// [system prompt](#g/system-prompt) to show a popover.

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  prompt: {
    term: "Prompt",
    definition: "Everything you send to Claude: your instructions, any background information, and your question.",
  },
  "api-key": {
    term: "API key",
    definition:
      "A secret password that lets a program use Claude on your Anthropic account. Usage is billed to that account, so keep it private.",
  },
  api: {
    term: "API",
    definition:
      "Application Programming Interface: the way programs talk to Claude directly instead of through the claude.ai chat app. This course uses Anthropic's Messages API behind the scenes.",
  },
  "system-prompt": {
    term: "System prompt",
    definition:
      "Instructions that sit above the conversation and set the ground rules: who Claude should be, how it should answer, what to avoid. Claude keeps them in mind for every reply.",
  },
  "user-turn": {
    term: "User turn",
    definition: "A message from you (the human) in the conversation.",
  },
  "assistant-turn": {
    term: "Assistant turn",
    definition: "A message from Claude in the conversation. In the API, Claude's role is called “assistant”.",
  },
  token: {
    term: "Token",
    definition:
      "The chunks of text Claude reads and writes, roughly ¾ of a word each. Usage and prices are counted in tokens: 1,000 tokens is about 750 words.",
  },
  model: {
    term: "Model",
    definition:
      "A specific version of Claude. Bigger models (Opus) are smarter but slower and pricier; smaller ones (Haiku) are fast and cheap.",
  },
  "xml-tags": {
    term: "XML tags",
    definition:
      "Labels in angle brackets, like <email> … </email>, that wrap a piece of text. Claude was trained to pay close attention to them, which makes them a great way to mark where data starts and ends.",
  },
  template: {
    term: "Prompt template",
    definition:
      "A reusable prompt with blanks to fill in, written like {TOPIC}. The same template can be filled with different values each time it runs.",
  },
  variable: {
    term: "Variable / placeholder",
    definition: "A blank in a prompt template, written in curly braces like {NAME}. It is replaced by real text before the prompt is sent.",
  },
  "prompt-injection": {
    term: "Prompt injection",
    definition:
      "When text your app puts into a prompt (an email, a web page, a user's message) contains instructions meant to hijack Claude. Mark outside text as data, and tell Claude not to follow instructions inside it.",
  },
  hallucination: {
    term: "Hallucination",
    definition:
      "When an AI states something false with confidence: an invented fact, quote, number or source. Good prompts make this much less likely.",
  },
  "few-shot": {
    term: "Few-shot prompting",
    definition: "Showing Claude a few examples of what you want (inputs and ideal outputs) so it copies the pattern.",
  },
  prefill: {
    term: "Prefill",
    definition:
      "An older technique where you wrote the first words of Claude's reply for it. Current Claude models no longer accept this; you steer the start of the answer with instructions instead.",
  },
  thinking: {
    term: "Thinking",
    definition:
      "Reasoning Claude does privately before it writes its answer. Current models decide for themselves how much to think; you control the depth with the effort setting.",
  },
  effort: {
    term: "Effort",
    definition:
      "A setting (low, medium or high) for how hard Claude thinks before answering. Higher effort can give better answers on hard problems, but is slower and uses more tokens.",
  },
  "context-window": {
    term: "Context window",
    definition: "How much text Claude can take in at once: the whole prompt plus its answer. Current models handle very long documents.",
  },
  "tool-use": {
    term: "Tool use",
    definition:
      "Letting Claude ask your program to do something (look up data, run a calculation, call a service) and then use the result in its answer.",
  },
  rag: {
    term: "Retrieval (RAG)",
    definition:
      "Retrieval-Augmented Generation: first find the documents relevant to a question, then give them to Claude so it answers from real sources instead of memory.",
  },
  eval: {
    term: "Eval",
    definition: "A set of test cases with known good answers, used to measure how well a prompt works and whether a change made it better.",
  },
  temperature: {
    term: "Randomness",
    definition:
      "Claude's answers vary a little each time, even for the same prompt. That's why you might need to run an exercise more than once.",
  },
};

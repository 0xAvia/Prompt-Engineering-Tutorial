# Prompt School

**An interactive, beginner-friendly prompt engineering course for Claude.** Short lessons, live prompt playgrounds you can edit and run, and exercises that check your work instantly. No coding required.

It's a rebuild of Anthropic's [Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) (Jupyter notebooks and a Google Sheet) as a single web page, rewritten in plain language for newcomers and updated for current Claude models.

![The Prompt School home page](docs/screenshot.png)

## What's inside

- **13 chapters**: 9 core chapters plus 4 appendix chapters, from "what is a prompt" to tool use and evals.
- **Live playgrounds**: every example is editable and runnable, with `{PLACEHOLDER}` templates, a "what Claude actually receives" preview, streaming answers, token and cost counts, and a **View as code** tab (Python/TypeScript) for the exact API call.
- **Auto-graded exercises**: a checklist of what the checker looks for, hints that unlock one at a time, sample solutions, and multi-input exercises graded per case.
- **Interactive widgets**: a message-anatomy explorer, a 10-element prompt builder, a prompt-chain runner, real tool use with tools that run in your browser, and a retrieval (RAG) sandbox.
- **Quick-check quizzes** that work without an API key.
- **Progress tracking**, light/dark themes, and layouts that work on a phone.

| Level | Chapters |
|---|---|
| Beginner | 1 Basic Prompt Structure · 2 Being Clear and Direct · 3 Assigning Roles |
| Intermediate | 4 Separating Data from Instructions · 5 Formatting Output · 6 Thinking Step by Step · 7 Using Examples |
| Advanced | 8 Avoiding Hallucinations · 9 Building Complex Prompts |
| Beyond prompting | 10.1 Chaining Prompts · 10.2 Tool Use · 10.3 Search & Retrieval · 10.4 Testing Your Prompts |

## How learners use Claude

Learners bring their own [Anthropic API key](https://platform.claude.com/settings/keys). The key is stored only in their browser (localStorage if they choose "remember", otherwise sessionStorage), and requests go **directly from the browser to Anthropic's API**. There's no server, so hosting costs nothing and nobody else's key is ever involved.

The default model is **Claude Haiku 5.5** ($0.10 / $0.50 per million input/output tokens), so working through the whole course costs a few cents. Learners can switch to Sonnet 5.5 or Opus 5.5 in Settings.

**No key?** Demo mode still lets people read every lesson, take the quizzes, and see recorded answers for the lesson examples (see below).

## Run it locally

Needs Node 22+.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (by default http://localhost:5173/Prompt-Engineering-Tutorial/).

## Record demo answers

Demo mode shows real Claude answers for the unedited lesson examples. They're recorded from the API, never hand-written. To record them (costs a fraction of a cent on Haiku 5.5):

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run record-demos
```

This fills `src/content/demo-responses.json`; commit it. Recordings are keyed by a hash of each prompt, so when you edit a lesson example, only that example gets re-recorded the next time you run the script. Use `-- --dry-run` to see what would be recorded and `-- --force` to re-record everything.

## Deploy to GitHub Pages

1. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions** (one time).
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, builds, and publishes to `https://<owner>.github.io/<repo>/`.

The site uses hash-based URLs (`#/learn/...`), so deep links work on Pages without any server configuration. To host it at a different path, build with `BASE_PATH=/your/path/ npm run build`.

## Tests

```bash
npm test
```

Unit and content tests (Vitest): graders, templates, request building, retrieval, tools, and checks that every lesson example is valid and every sample solution passes its own prompt checks.

```bash
npm run e2e
```

End-to-end tests (Playwright) that mock the Anthropic API: page rendering on a phone, streaming, grading, hints, multi-input exercises, tool use, chaining, error messages and demo mode.

## Project structure

```
src/
  content/
    chapters/*.ts       one file per chapter: lesson text, examples, exercises, graders, hints, quiz
    course.ts           chapter order and progress helpers
    types.ts            the content model
    docs/ tools.ts retrieval.ts chains.ts builder.ts   data for exercises and widgets
    demo-responses.json recorded answers for demo mode
  components/           playground, editor, exercise card, quiz, widgets (components/custom)
  lib/                  Claude client, graders, templates, storage, tool-use loop
  pages/                home, setup, chapter, playground, settings
scripts/record-demos.ts
tests/  e2e/
```

Chapters are plain TypeScript data, so adding or editing a lesson doesn't touch any UI code. A chapter is a list of sections made of blocks: `text`, `callout`, `playground`, `compare`, `exercise` and `custom`. Graders are small, readable helpers (`contains`, `containsAny`, `exactly`, `minWords`, `usesVariable`, …) in `src/lib/graders.ts`.

## What changed from the original tutorial

The original was written for Claude 3. A few techniques changed since then:

- **Prefill** ("speaking for Claude") is no longer accepted by current models, so Chapter 5 teaches steering the start of an answer with instructions instead, and mentions structured outputs.
- **Temperature** can't be changed on current models, so answers vary run to run. Graders are a little more tolerant, and the UI encourages re-running.
- **Built-in thinking** is covered in Chapter 6 alongside "think step by step".
- **Tool use** uses the API's real tool-calling instead of the simulated XML version.
- The Chapter 8 Beyoncé question became answerable (her eighth album came out in 2024), so it was replaced with a question that's still a hallucination trap.
- New: a retrieval sandbox (10.3) and a chapter on testing prompts with evals (10.4).

## Credits

Exercise scenarios, example prompts and sample documents are adapted from Anthropic's [prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) (the Amazon Bedrock edition in that repository is MIT-0 licensed). Lesson text was rewritten for beginners. This project is unofficial and not affiliated with or endorsed by Anthropic.

import { expect, test, type Page, type Route } from "@playwright/test";
import { chapters } from "../src/content/course";

// ---------- helpers: a fake Anthropic API ----------

function sse(text: string, opts: { stop?: string } = {}): string {
  const ev = (type: string, data: object) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  const chunks = text.match(/[\s\S]{1,12}/g) ?? [""];
  return (
    ev("message_start", {
      message: { id: "msg_test", type: "message", role: "assistant", model: "claude-haiku-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 25, output_tokens: 1 } },
    }) +
    ev("content_block_start", { index: 0, content_block: { type: "text", text: "" } }) +
    chunks.map((c) => ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: c } })).join("") +
    ev("content_block_stop", { index: 0 }) +
    ev("message_delta", { delta: { stop_reason: opts.stop ?? "end_turn", stop_sequence: null }, usage: { output_tokens: 12 } }) +
    ev("message_stop", {})
  );
}

type Reply = string | ((body: { messages: { content: string }[]; [k: string]: unknown }) => string);

/** Mock POST /v1/messages; records every request body and header set. */
async function mockClaude(page: Page, reply: Reply) {
  const requests: { body: Record<string, unknown>; headers: Record<string, string> }[] = [];
  await page.route("https://api.anthropic.com/v1/messages*", async (route: Route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors() });
    const body = req.postDataJSON();
    requests.push({ body, headers: await req.allHeaders() });
    const text = typeof reply === "function" ? reply(body) : reply;
    await route.fulfill({ status: 200, headers: { ...cors(), "content-type": "text/event-stream" }, body: sse(text) });
  });
  return requests;
}

function cors() {
  return { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
}

async function withKey(page: Page) {
  await page.addInitScript(() => localStorage.setItem("ps.apiKey", "sk-ant-test-key"));
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

async function typeInto(page: Page, scope: string, text: string, editorIndex = 0) {
  const editor = page.locator(`${scope} .cm-content[contenteditable="true"]`).nth(editorIndex);
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type(text);
}

// ---------- tests ----------

test("every page renders without errors or sideways scrolling on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const errors = trackErrors(page);
  const routes = ["", "setup", "settings", "playground", ...chapters.map((c) => `learn/${c.id}`)];
  for (const r of routes) {
    await page.goto(`#/${r}`);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on /${r}`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test("saving a key checks it with Anthropic and leaves demo mode", async ({ page }) => {
  await page.route("https://api.anthropic.com/v1/models/*", (route) =>
    route.fulfill({ status: 200, headers: { ...cors(), "content-type": "application/json" }, body: JSON.stringify({ id: "claude-haiku-5-5", type: "model", display_name: "Claude Haiku 5.5", created_at: "2026-01-01T00:00:00Z" }) }),
  );
  await page.goto("#/");
  await page.getByRole("button", { name: "Demo mode" }).click();
  await page.getByRole("textbox", { name: "API key" }).fill("sk-ant-test-key");
  await page.getByRole("button", { name: "Save key" }).click();
  await expect(page.getByText("Key works")).toBeVisible();
  await expect(page.getByRole("button", { name: "Key added" })).toBeVisible();
});

test("a playground streams Claude's answer and sends a valid request", async ({ page }) => {
  await withKey(page);
  const requests = await mockClaude(page, "I'm doing well, thank you for asking!");
  await page.goto("#/learn/basic-prompt-structure");
  const card = page.getByRole("region", { name: "Say hello" });
  await card.getByRole("button", { name: "Run", exact: true }).click();
  await expect(card.getByText("I'm doing well, thank you for asking!")).toBeVisible();
  await expect(card.getByText("37 tokens")).toBeVisible();

  const { body, headers } = requests[0];
  expect(body.model).toBe("claude-haiku-5-5");
  expect(body.stream).toBe(true);
  expect(body).not.toHaveProperty("temperature");
  expect(body.thinking).toEqual({ type: "disabled" });
  expect(body.messages).toEqual([{ role: "user", content: "Hi Claude, how are you?" }]);
  expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
  // Current SDKs send API keys as a bearer token.
  expect(headers["authorization"]).toBe("Bearer sk-ant-test-key");
});

test("an exercise passes and fails based on Claude's answer", async ({ page }) => {
  await withKey(page);
  let answer = "One, two, three!";
  await mockClaude(page, () => answer);
  await page.goto("#/learn/basic-prompt-structure");
  const scope = 'section[aria-labelledby="ex-1.1"]';
  const ex = page.locator(scope);
  await typeInto(page, scope, "Count to three.");
  await ex.getByRole("button", { name: "Run & check" }).click();
  await expect(ex.getByText("Not quite yet")).toBeVisible();

  answer = "1, 2, 3";
  await ex.getByRole("button", { name: "Run & check" }).click();
  await expect(ex.getByText("Solved, nice work!")).toBeVisible();
  await expect(ex.getByText("Solved", { exact: true })).toBeVisible();

  // Progress is saved and shown on the home page.
  await page.goto("#/");
  await expect(page.getByText("1/2 exercises").first()).toBeVisible();
});

test("hints reveal one at a time, then a solution that can be copied in", async ({ page }) => {
  await page.goto("#/learn/basic-prompt-structure");
  const ex = page.locator('section[aria-labelledby="ex-1.1"]');
  await ex.getByRole("button", { name: "Need a hint?" }).click();
  await expect(ex.getByText("Hint 1")).toBeVisible();
  await ex.getByRole("button", { name: "Show another hint" }).click();
  await expect(ex.getByText("Hint 2")).toBeVisible();
  await ex.getByRole("button", { name: "Show a sample solution" }).click();
  await ex.getByRole("button", { name: "Copy into the editor" }).click();
  await expect(ex.locator(".cm-content").first()).toContainText("Count from 1 to 3");
});

test("multi-case exercises run every input and grade each one", async ({ page }) => {
  await withKey(page);
  const requests = await mockClaude(page, (body) => {
    const prompt = body.messages.at(-1)!.content;
    if (prompt.includes("Mixmaster4000 is producing")) return "<answer>B</answer>";
    if (prompt.includes("mix paint")) return "<answer>A</answer>";
    if (prompt.includes("MONTHLY CHARGES")) return "<answer>C</answer>";
    return "<answer>A</answer>"; // wrong on purpose: should be D
  });
  await page.goto("#/learn/thinking-step-by-step");
  const scope = 'section[aria-labelledby="ex-6.2"]';
  const ex = page.locator(scope);
  await typeInto(page, scope, "Classify this email and put the letter in <answer> tags: {email}");
  await ex.getByRole("button", { name: /Run on all 4 inputs/ }).click();
  await expect(ex.getByText("3 of 4 inputs passed.")).toBeVisible();
  expect(requests).toHaveLength(4);
  expect(requests.every((r) => !(r.body.messages as { content: string }[])[0].content.includes("{email}"))).toBe(true);
});

test("a bad key shows a friendly message", async ({ page }) => {
  await withKey(page);
  await page.route("https://api.anthropic.com/v1/messages*", (route) =>
    route.fulfill({
      status: 401,
      headers: { ...cors(), "content-type": "application/json" },
      body: JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }),
    }),
  );
  await page.goto("#/learn/basic-prompt-structure");
  const card = page.getByRole("region", { name: "Say hello" });
  await card.getByRole("button", { name: "Run", exact: true }).click();
  await expect(card.getByText("Your API key didn't work")).toBeVisible();
  await expect(card.getByRole("button", { name: "Update API key" })).toBeVisible();
});

test("without a key, run buttons open the key dialog and quizzes still work", async ({ page }) => {
  await page.goto("#/learn/basic-prompt-structure");
  await page.getByRole("region", { name: "Say hello" }).getByRole("button", { name: "Add API key to run" }).click();
  await expect(page.getByRole("heading", { name: "Your Anthropic API key" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("radiogroup", { name: "Question 1" }).getByRole("radio", { name: "A user turn" }).click();
  await expect(page.getByText("Correct.").first()).toBeVisible();
});

test("variables are substituted and previewed", async ({ page }) => {
  await withKey(page);
  const requests = await mockClaude(page, "Moo!");
  await page.goto("#/learn/separating-data-and-instructions");
  const card = page.getByRole("region", { name: "An animal-noise template" });
  await card.locator("textarea").fill("Duck");
  await card.getByRole("button", { name: "Preview what Claude actually receives" }).click();
  await expect(card.getByText(/please respond with the noise that animal makes\. Duck/i)).toBeVisible();
  await card.getByRole("button", { name: "Run", exact: true }).click();
  await expect(card.getByText("Moo!")).toBeVisible();
  expect((requests[0].body.messages as { content: string }[])[0].content).toContain("makes. Duck");
});

test("tool use: Claude calls the calculator, the browser runs it, Claude answers", async ({ page }) => {
  await withKey(page);
  const bodies: Record<string, unknown>[] = [];
  await page.route("https://api.anthropic.com/v1/messages*", async (route) => {
    const body = route.request().postDataJSON();
    bodies.push(body);
    const last = body.messages.at(-1);
    const toolResult = Array.isArray(last.content) && last.content[0]?.type === "tool_result" ? last.content[0] : null;
    const message = toolResult
      ? { content: [{ type: "text", text: `The answer is ${toolResult.content}.` }], stop_reason: "end_turn" }
      : { content: [{ type: "tool_use", id: "toolu_1", name: "calculator", input: { operand1: 1984135, operand2: 9343116, operation: "*" } }], stop_reason: "tool_use" };
    await route.fulfill({
      status: 200,
      headers: { ...cors(), "content-type": "application/json" },
      body: JSON.stringify({ id: "msg", type: "message", role: "assistant", model: "claude-haiku-5-5", stop_sequence: null, usage: { input_tokens: 50, output_tokens: 20 }, ...message }),
    });
  });
  await page.goto("#/learn/tool-use");
  await page.getByRole("button", { name: "Run", exact: true }).first().click();
  const product = String(1984135 * 9343116);
  await expect(page.getByText(`The answer is ${product}.`)).toBeVisible();
  expect(bodies).toHaveLength(2);
  // The second request sends Claude's tool call back with the result, in order.
  const msgs = bodies[1].messages as { role: string; content: { type: string }[] }[];
  expect(msgs.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
  expect(msgs[2].content[0].type).toBe("tool_result");
});

test("a chain feeds step 1's answer into step 2", async ({ page }) => {
  await withKey(page);
  const requests = await mockClaude(page, (body) => (body.messages.at(-1)!.content.includes("Alphabetize") ? "Erin\nJesse" : "<names>\nJesse\nErin\n</names>"));
  await page.goto("#/learn/chaining-prompts");
  await page.getByRole("button", { name: "Run the chain" }).nth(2).click();
  await expect(page.getByText("Step 2 answer").last()).toBeVisible();
  await expect.poll(() => requests.length).toBe(2);
  expect((requests[1].body.messages as { content: string }[])[0].content).toContain("<names>\nJesse\nErin\n</names>");
});

import { describe, expect, it } from "vitest";
import { fillTemplate, findVariables, missingVariables, splitFilled } from "../src/lib/template";
import { resolveRequest, toParams, validateRequest } from "../src/lib/claude";
import { dedent } from "../src/lib/md";

describe("template", () => {
  it("finds unique placeholders in order", () => {
    expect(findVariables("Write about {TOPIC} for {AUDIENCE}", "More {TOPIC}")).toEqual(["TOPIC", "AUDIENCE"]);
  });

  it("ignores braces that aren't placeholders", () => {
    expect(findVariables('JSON like {"a": 1} and { spaced }')).toEqual([]);
  });

  it("fills known placeholders and leaves unknown ones", () => {
    expect(fillTemplate("A haiku about {TOPIC} by {POET}", { TOPIC: "pigs" })).toBe("A haiku about pigs by {POET}");
  });

  it("splits filled text for highlighting", () => {
    expect(splitFilled("Hi {NAME}!", { NAME: "Ada" })).toEqual([{ text: "Hi " }, { text: "Ada", variable: "NAME" }, { text: "!" }]);
  });

  it("reports missing variables", () => {
    expect(missingVariables(["{A} {B}"], { A: "x" })).toEqual(["B"]);
  });
});

describe("request building", () => {
  it("substitutes variables into system and user", () => {
    const r = resolveRequest({ system: "You love {THING}.", user: "Tell me about {THING}.", variables: { THING: "cats" } }, "claude-haiku-5-5");
    expect(r.system).toBe("You love cats.");
    expect(r.messages).toEqual([{ role: "user", content: "Tell me about cats." }]);
  });

  it("never sends temperature or an assistant prefill", () => {
    const p = toParams(resolveRequest({ user: "Hi" }, "claude-haiku-5-5"));
    expect(p).not.toHaveProperty("temperature");
    expect(p.messages.at(-1)!.role).toBe("user");
  });

  it("always uses adaptive thinking, with effort defaulting to low", () => {
    for (const model of ["claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5"]) {
      const p = toParams(resolveRequest({ user: "Hi" }, model));
      expect(p.thinking).toEqual({ type: "adaptive", display: "summarized" });
      expect(p.output_config).toEqual({ effort: "low" });
    }
  });

  it("leaves more room for thinking at higher effort", () => {
    const low = resolveRequest({ user: "Hi" }, "claude-haiku-5-5").maxTokens;
    const high = resolveRequest({ user: "Hi", effort: "high" }, "claude-haiku-5-5").maxTokens;
    expect(high).toBeGreaterThan(low);
  });

  it("adds a JSON schema as structured output", () => {
    const schema = { type: "object", properties: { a: { type: "string" } }, required: ["a"], additionalProperties: false };
    const p = toParams(resolveRequest({ user: "Hi", outputSchema: schema, effort: "medium" }, "claude-haiku-5-5"));
    expect(p.output_config).toEqual({ effort: "medium", format: { type: "json_schema", schema } });
  });

  it("validates empty messages and alternation", () => {
    expect(validateRequest(resolveRequest({ user: "  " }, "claude-haiku-5-5"))).toMatch(/empty/);
    expect(
      validateRequest(resolveRequest({ history: [{ role: "user", content: "a" }], user: "b" }, "claude-haiku-5-5")),
    ).toMatch(/alternate/);
    expect(
      validateRequest(
        resolveRequest({ history: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }], user: "c" }, "claude-haiku-5-5"),
      ),
    ).toBeNull();
  });

  it("drops a blank system prompt", () => {
    expect(resolveRequest({ system: "   ", user: "Hi" }, "claude-haiku-5-5").system).toBeUndefined();
  });
});

describe("md", () => {
  it("dedents and trims", () => {
    expect(dedent("\n    a\n      b\n    c\n  ")).toBe("a\n  b\nc");
  });
});

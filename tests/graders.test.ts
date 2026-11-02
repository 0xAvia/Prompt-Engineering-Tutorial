import { describe, expect, it } from "vitest";
import { answerTag, categoryLine, letterAndName } from "../src/content/docs/emails";
import { DOCS, retrieve } from "../src/content/retrieval";
import { DB_SOLUTION, DB_TESTS, buildDbTools, initialDb, runCalculator, runDbTool } from "../src/content/tools";
import { ANIMAL_WORDS, allPass, containsAny, doesNotHardcode, exactly, grade, minWords, wordCount } from "../src/lib/graders";

describe("graders", () => {
  it("exact match ignores surrounding whitespace only", () => {
    const c = exactly("Michael Jordan");
    expect(c.test("  Michael Jordan\n")).toBe(true);
    expect(c.test("Michael Jordan.")).toBe(false);
    expect(c.test("It's Michael Jordan")).toBe(false);
  });

  it("counts words like the original (whitespace split)", () => {
    expect(wordCount("one two\nthree   four")).toBe(4);
    expect(wordCount("   ")).toBe(0);
    expect(minWords(3).test("a b c")).toBe(true);
  });

  it("does not flag words that merely contain a hard-coded word", () => {
    const c = doesNotHardcode("cat");
    expect(c.test("Please indicate the category of {ANIMAL1}")).toBe(true);
    expect(c.test("Write about cats")).toBe(false);
  });

  it("recognises a poem about an animal that never names it", () => {
    expect(containsAny(ANIMAL_WORDS.cat).test("<haiku>\nsoft paws, purring dreams\n</haiku>")).toBe(true);
  });

  it("grade() never throws and allPass needs at least one result", () => {
    const boom = { label: "boom", test: () => { throw new Error("x"); } };
    expect(grade("x", [boom])).toEqual([{ label: "boom", pass: false }]);
    expect(allPass([])).toBe(false);
  });
});

describe("email graders (chapters 6 & 7)", () => {
  it("accepts the original's 'B) B' style, either answer for ambiguous emails", () => {
    expect(letterAndName(["B"]).test("(B) Broken or defective item")).toBe(true);
    expect(letterAndName(["A", "D"]).test("(D) Other (please explain)")).toBe(true);
    expect(letterAndName(["C"]).test("(B) Broken or defective item")).toBe(false);
  });
  it("checks exact answer tags", () => {
    expect(answerTag(["B"]).test("<thinking>…</thinking>\n<answer>B</answer>")).toBe(true);
    expect(answerTag(["B"]).test("<answer>(B)</answer>")).toBe(false);
  });
  it("checks the exact one-line category format", () => {
    expect(categoryLine(["C"]).test("Category: C")).toBe(true);
    expect(categoryLine(["C"]).test("  Category: C\n")).toBe(true);
    expect(categoryLine(["A", "D"]).test("Category: D")).toBe(true);
    expect(categoryLine(["C"]).test("Category: C (Billing question)")).toBe(false);
    expect(categoryLine(["C"]).test("Category: B")).toBe(false);
  });
});

describe("retrieval (10.3)", () => {
  it("finds the right article for the exercise questions", () => {
    expect(retrieve("How long is the warranty on e-bike batteries?")[0].doc.id).toBe(2);
    expect(retrieve("Is the Seattle store open on Mondays?")[0].doc.id).toBe(5);
    expect(retrieve("How much is a flat tyre repair?")[0].doc.id).toBe(7);
  });
  it("returns at most k documents, all from the corpus", () => {
    const hits = retrieve("battery charge warranty store", 3);
    expect(hits.length).toBeLessThanOrEqual(3);
    for (const h of hits) expect(DOCS).toContain(h.doc);
  });
});

describe("tools (10.2)", () => {
  it("calculator does exact arithmetic and reports errors", () => {
    expect(runCalculator({ operand1: 1984135, operand2: 9343116, operation: "*" })).toBe(String(1984135 * 9343116));
    expect(() => runCalculator({ operand1: 1, operand2: 0, operation: "/" })).toThrow();
  });
  it("database tools read and write a copy of the db", () => {
    const db = initialDb();
    expect(runDbTool(db, "fn_a", { x: 2 })).toMatchObject({ name: "Bob" });
    runDbTool(db, "fn_c", { x: "Deborah", y: "" });
    expect(db.users).toHaveLength(4);
    expect(initialDb().users).toHaveLength(3);
    expect(() => runDbTool(db, "fn_b", { x: 99 })).toThrow();
  });
  it("builds valid tool definitions, omitting empty descriptions", () => {
    const tools = buildDbTools({ fn_a: "  ", fn_b: "Gets a product" });
    expect(tools[0]).not.toHaveProperty("description");
    expect(tools[1].description).toBe("Gets a product");
    expect(buildDbTools(DB_SOLUTION).every((t) => t.description)).toBe(true);
  });
  it("test expectations match the sample db", () => {
    expect(DB_TESTS.find((t) => t.expectTool === "fn_a")!.inputOk({ x: 2 })).toBe(true);
    expect(DB_TESTS.find((t) => t.expectTool === "fn_b")!.inputOk({ x: "3" })).toBe(true);
  });
});

import type Anthropic from "@anthropic-ai/sdk";

// Data for Appendix 10.2 (tool use). The database is the "world's smallest database"
// from the original tutorial's exercise.

export interface Db {
  users: { id: number; name: string; email: string }[];
  products: { id: number; name: string; price: number }[];
}

export const initialDb = (): Db => ({
  users: [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
    { id: 3, name: "Charlie", email: "charlie@example.com" },
  ],
  products: [
    { id: 1, name: "Widget", price: 9.99 },
    { id: 2, name: "Gadget", price: 14.99 },
    { id: 3, name: "Doohickey", price: 19.99 },
  ],
});

// ---------- Calculator demo ----------

export const calculatorTool: Anthropic.Tool = {
  name: "calculator",
  description: "A simple calculator that performs basic arithmetic on two numbers. Use it for any arithmetic so the result is exact.",
  input_schema: {
    type: "object",
    properties: {
      operand1: { type: "number", description: "The first number." },
      operand2: { type: "number", description: "The second number." },
      operation: { type: "string", enum: ["+", "-", "*", "/"], description: "The operation to perform." },
    },
    required: ["operand1", "operand2", "operation"],
  },
};

export function runCalculator(input: Record<string, unknown>): string {
  const a = Number(input.operand1);
  const b = Number(input.operand2);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Both operands must be numbers.");
  switch (input.operation) {
    case "+":
      return String(a + b);
    case "-":
      return String(a - b);
    case "*":
      return String(a * b);
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero.");
      return String(a / b);
    default:
      throw new Error(`Unknown operation: ${String(input.operation)}`);
  }
}

// ---------- Database exercise ----------

/** The four tools, with deliberately unhelpful names. The learner writes the descriptions. */
export interface DbToolSpec {
  name: string;
  params: { name: string; type: "integer" | "string" | "number" }[];
}

export const DB_TOOLS: DbToolSpec[] = [
  { name: "fn_a", params: [{ name: "x", type: "integer" }] },
  { name: "fn_b", params: [{ name: "x", type: "integer" }] },
  { name: "fn_c", params: [{ name: "x", type: "string" }, { name: "y", type: "string" }] },
  { name: "fn_d", params: [{ name: "x", type: "string" }, { name: "y", type: "number" }] },
];

/** A sample set of good descriptions (revealed as the solution). */
export const DB_SOLUTION: Record<string, string> = {
  fn_a: "Looks up a user in the database by their ID. x = the user's ID (an integer). Returns the user's id, name and email.",
  fn_b: "Looks up a product in the database by its ID. x = the product's ID (an integer). Returns the product's id, name and price.",
  fn_c: "Adds a new user to the database. x = the user's name, y = the user's email address (use an empty string if not given).",
  fn_d: "Adds a new product to the database. x = the product's name, y = its price in dollars (use 0 if not given).",
};

export function buildDbTools(descriptions: Record<string, string>): Anthropic.Tool[] {
  return DB_TOOLS.map((t) => ({
    name: t.name,
    ...(descriptions[t.name]?.trim() ? { description: descriptions[t.name].trim() } : {}),
    input_schema: {
      type: "object" as const,
      properties: Object.fromEntries(t.params.map((p) => [p.name, { type: p.type }])),
      required: t.params.map((p) => p.name),
    },
  }));
}

/** Executes a database tool against `db` (mutating it for the add tools). */
export function runDbTool(db: Db, name: string, input: Record<string, unknown>): unknown {
  switch (name) {
    case "fn_a": {
      const u = db.users.find((x) => x.id === Number(input.x));
      if (!u) throw new Error(`No user with id ${String(input.x)}`);
      return u;
    }
    case "fn_b": {
      const p = db.products.find((x) => x.id === Number(input.x));
      if (!p) throw new Error(`No product with id ${String(input.x)}`);
      return p;
    }
    case "fn_c": {
      const u = { id: db.users.length + 1, name: String(input.x ?? ""), email: String(input.y ?? "") };
      db.users.push(u);
      return { added: u };
    }
    case "fn_d": {
      const p = { id: db.products.length + 1, name: String(input.x ?? ""), price: Number(input.y ?? 0) };
      db.products.push(p);
      return { added: p };
    }
    default:
      throw new Error(`Unknown tool ${name}`);
  }
}

export interface DbTest {
  request: string;
  expectTool: string;
  /** Checks the tool input. */
  inputOk: (input: Record<string, unknown>) => boolean;
  expectLabel: string;
  /** Optional check on Claude's final answer. */
  answerIncludes?: string;
}

export const DB_TESTS: DbTest[] = [
  {
    request: "Add a user to the database named Deborah, with the email deborah@example.com.",
    expectTool: "fn_c",
    inputOk: (i) => String(i.x).toLowerCase().includes("deborah"),
    expectLabel: "Calls fn_c (add user) with the name Deborah",
  },
  {
    request: "Add a product to the database named Thingo, priced at $24.99.",
    expectTool: "fn_d",
    inputOk: (i) => String(i.x).toLowerCase().includes("thingo"),
    expectLabel: "Calls fn_d (add product) with the name Thingo",
  },
  {
    request: "Tell me the name of User 2.",
    expectTool: "fn_a",
    inputOk: (i) => Number(i.x) === 2,
    expectLabel: "Calls fn_a (get user) with ID 2",
    answerIncludes: "Bob",
  },
  {
    request: "Tell me the name of Product 3.",
    expectTool: "fn_b",
    inputOk: (i) => Number(i.x) === 3,
    expectLabel: "Calls fn_b (get product) with ID 3",
    answerIncludes: "Doohickey",
  },
];

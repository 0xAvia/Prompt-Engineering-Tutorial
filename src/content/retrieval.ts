// Data for Appendix 10.3 (search & retrieval): the help-centre articles of a fictional
// bike shop. Because it's fictional, Claude can't know the answers from training. It has
// to use the retrieved documents, which is exactly the point.

export interface Doc {
  id: number;
  title: string;
  text: string;
}

export const DOCS: Doc[] = [
  {
    id: 1,
    title: "Returns and refunds",
    text: "Unused items can be returned within 30 days with a receipt. Bikes can be returned within 14 days if they have been ridden less than 50 km. Refunds go back to the original payment method within 5 business days of us receiving the item.",
  },
  {
    id: 2,
    title: "Warranty",
    text: "Every Brightwater frame has a lifetime warranty for the original owner. Components such as gears and brakes are covered for 2 years. E-bike batteries are covered for 3 years or 800 charge cycles, whichever comes first. Damage from crashes is not covered.",
  },
  {
    id: 3,
    title: "Shipping",
    text: "Shipping is free on orders over $75 within the US. Bikes ship in 5 to 7 business days and arrive 90% assembled; you only need to attach the handlebars and pedals. We currently ship internationally to Canada and the UK only.",
  },
  {
    id: 4,
    title: "E-bike battery care",
    text: "If you won't ride for more than a month, store your e-bike battery at 40 to 60% charge. Only charge it at temperatures between 0°C and 40°C. A full charge takes about 4.5 hours with the standard charger, or 2.5 hours with the fast charger.",
  },
  {
    id: 5,
    title: "Store locations and opening hours",
    text: "We have two stores. Portland is open Monday to Saturday 9am to 7pm and Sunday 10am to 5pm. Seattle is open Tuesday to Sunday 10am to 6pm and is closed on Mondays. Both stores are closed on public holidays.",
  },
  {
    id: 6,
    title: "Brightwater Riders Club membership",
    text: "Riders Club membership costs $49 a year. Members get 10% off parts and accessories, a free tune-up every year, and early access to our seasonal sales. You can cancel any time from your account page.",
  },
  {
    id: 7,
    title: "Repairs and servicing",
    text: "Book repairs online or in store. A standard tune-up costs $89. Flat tyres are fixed for $20 while you wait. In peak season (April to August) most repairs take 3 to 5 days; the rest of the year it's usually 1 to 2 days.",
  },
  {
    id: 8,
    title: "Trade-in programme",
    text: "Bring in your old bike and get store credit of up to 30% of the price of a new Brightwater bike. Trade-in bikes must be rideable. Bikes we can't resell are donated to local schools.",
  },
];

const STOP = new Set(
  "a an and are as at be bike bikes brightwater by can do does for from has have how i in is it its long me much my of on or our the their there this to was what when where which who why will with you your".split(" "),
);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem).filter((w) => w.length > 1 && !STOP.has(w));
}

/** Very light stemming so "batteries" matches "battery" and "Mondays" matches "Monday". */
function stem(w: string): string {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

const docTokens = DOCS.map((d) => tokens(`${d.title} ${d.title} ${d.text}`));
const df = new Map<string, number>();
for (const ts of docTokens) for (const t of new Set(ts)) df.set(t, (df.get(t) ?? 0) + 1);

export interface Hit {
  doc: Doc;
  score: number;
}

/** A tiny keyword search (TF-IDF): good enough to show how retrieval works. */
export function retrieve(question: string, k = 3): Hit[] {
  const q = [...new Set(tokens(question))];
  return DOCS.map((doc, i) => {
    let score = 0;
    for (const t of q) {
      const tf = docTokens[i].filter((x) => x === t).length;
      if (tf) score += (1 + Math.log(tf)) * Math.log(1 + DOCS.length / (df.get(t) ?? 1));
    }
    return { doc, score: Math.round(score * 100) / 100 };
  })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Format retrieved documents for a prompt, in the nested structure Anthropic recommends for multiple documents. */
export function formatDocs(hits: Hit[]): string {
  if (!hits.length) return "(no matching documents found)";
  return hits
    .map((h) => `<document index="${h.doc.id}">\n<source>${h.doc.title}</source>\n<document_content>\n${h.doc.text}\n</document_content>\n</document>`)
    .join("\n");
}

export const RAG_DEFAULT_TEMPLATE = `Here are some articles from the Brightwater Bikes help centre:
<documents>
{DOCUMENTS}
</documents>

Answer the customer's question using only these documents. After each fact you use, cite the document index in square brackets, like [3]. If the documents don't contain the answer, say you don't have that information instead of guessing.

<question>
{QUESTION}
</question>`;

// Trains a multinomial Naive Bayes scam classifier (pure JavaScript, no Python needed).
//   npm run train
//   npm run train -- --data path\to\labelled.csv --out model\scam-model.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tokenize } from "./features.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const dataFile = args.data ?? path.join(here, "data", "training.csv");
const outFile = args.out ?? path.join(here, "..", "model", "scam-model.json");

if (!args.data && !fs.existsSync(dataFile)) await import("./generate-dataset.js");

const SCAM = new Set(["scam", "spam", "1", "fraud", "phishing"]);
const HAM = new Set(["ham", "legit", "0", "safe"]);

function readRows(file) {
  const rows = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*"?([^\t,"]+)"?[\t,](.*)$/);
    if (!m) continue;
    const label = m[1].trim().toLowerCase();
    if (!SCAM.has(label) && !HAM.has(label)) continue; // skips header + junk
    rows.push({ y: SCAM.has(label) ? 1 : 0, text: m[2].trim().replace(/^"|"$/g, "") });
  }
  return rows;
}

function fit(rows) {
  const counts = [new Map(), new Map()];
  const totals = [0, 0];
  const docs = [0, 0];
  const vocab = new Set();
  for (const { y, text } of rows) {
    docs[y]++;
    for (const t of tokenize(text)) {
      counts[y].set(t, (counts[y].get(t) ?? 0) + 1);
      totals[y]++;
      vocab.add(t);
    }
  }
  const V = vocab.size;
  const alpha = 1;
  const table = {};
  for (const t of vocab) {
    table[t] = [
      Math.log(((counts[1].get(t) ?? 0) + alpha) / (totals[1] + alpha * V)),
      Math.log(((counts[0].get(t) ?? 0) + alpha) / (totals[0] + alpha * V)),
    ];
  }
  const n = docs[0] + docs[1];
  return { priors: { scam: docs[1] / n, ham: docs[0] / n }, vocab: table };
}

function predict(model, text) {
  let s = Math.log(model.priors.scam);
  let h = Math.log(model.priors.ham);
  for (const t of tokenize(text)) {
    const e = model.vocab[t];
    if (e) { s += e[0]; h += e[1]; }
  }
  return s > h ? 1 : 0;
}

function shuffle(a) {
  let seed = 42;
  const r = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const rows = readRows(dataFile);
if (rows.length < 40) {
  console.error(`Not enough labelled rows in ${dataFile} (found ${rows.length}).`);
  process.exit(1);
}
const shuffled = shuffle([...rows]);
const cut = Math.floor(shuffled.length * 0.8);
const train = shuffled.slice(0, cut);
const test = shuffled.slice(cut);

const evalModel = fit(train);
let tp = 0, fp = 0, tn = 0, fn = 0;
for (const { y, text } of test) {
  const p = predict(evalModel, text);
  if (p && y) tp++; else if (p && !y) fp++; else if (!p && !y) tn++; else fn++;
}
const accuracy = (tp + tn) / test.length;
const precision = tp / Math.max(1, tp + fp);
const recall = tp / Math.max(1, tp + fn);
const f1 = (2 * precision * recall) / Math.max(1e-9, precision + recall);

const final = fit(rows); // refit on everything for the shipped model
const meta = {
  trainedAt: new Date().toISOString(),
  algorithm: "multinomial-naive-bayes (unigrams+bigrams)",
  dataset: path.basename(dataFile),
  rows: rows.length,
  holdout: { rows: test.length, accuracy, precision, recall, f1 },
  note: "Metrics come from a holdout split. With the bundled synthetic dataset they are optimistic - train on real labelled messages before trusting them.",
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ ...final, meta }));

console.log(`Trained on ${rows.length} rows (${train.length} train / ${test.length} holdout)`);
console.log(`Holdout  accuracy=${(accuracy * 100).toFixed(1)}%  precision=${(precision * 100).toFixed(1)}%  recall=${(recall * 100).toFixed(1)}%  f1=${(f1 * 100).toFixed(1)}%`);
console.log(`Vocabulary: ${Object.keys(final.vocab).length} features`);
console.log(`Model saved to ${path.relative(process.cwd(), outFile)}`);

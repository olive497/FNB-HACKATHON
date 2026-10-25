// ScamShield: transparent rule engine (same rules as the frontend) + optional trained Naive Bayes model.
// Message text is analysed in memory only - it is never stored or logged.
import fs from "node:fs";
import { scamRules } from "../data/index.js";
import { config } from "../config.js";
import { tokenize } from "../../ml/features.js";

const compiled = scamRules.map((r) => ({ ...r, regex: new RegExp(r.pattern, r.flags.includes("g") ? r.flags : r.flags + "g") }));

let model = null;
let modelTried = false;
export function loadModel(force = false) {
  if (modelTried && !force) return model;
  modelTried = true;
  try {
    model = JSON.parse(fs.readFileSync(config.modelFile, "utf8"));
  } catch {
    model = null;
  }
  return model;
}

export function ruleAnalysis(text) {
  const detected = [];
  let score = 0;
  for (const rule of compiled) {
    rule.regex.lastIndex = 0;
    const matches = text.match(rule.regex);
    if (matches) {
      detected.push({
        rule: { id: rule.id, label: rule.label, weight: rule.weight, why: rule.why },
        matches: matches.slice(0, 3),
      });
      score += rule.weight;
    }
  }
  return { score, detected };
}

export function mlAnalysis(text) {
  const m = loadModel();
  if (!m) return { available: false };
  const tokens = tokenize(text);
  let logScam = Math.log(m.priors.scam);
  let logHam = Math.log(m.priors.ham);
  const contributions = [];
  for (const t of tokens) {
    const entry = m.vocab[t];
    if (!entry) continue; // unseen tokens carry no information
    logScam += entry[0];
    logHam += entry[1];
    contributions.push([t, entry[0] - entry[1]]);
  }
  const probability = 1 / (1 + Math.exp(Math.max(-30, Math.min(30, logHam - logScam))));
  const signals = probability > 0.5 ? contributions.filter(([, d]) => d > 1).sort((a, b) => b[1] - a[1]).map(([t]) => t).filter((t, i, a) => a.indexOf(t) === i).slice(0, 5) : [];
  return {
    available: true,
    probability: Number(probability.toFixed(4)),
    signals,
    trainedAt: m.meta?.trainedAt,
  };
}

export function analyseMessage(text) {
  const rules = ruleAnalysis(text);
  const ml = mlAnalysis(text);
  const mlPct = ml.available ? ml.probability * 100 : 0;
  let score = ml.available ? Math.round(0.65 * Math.min(rules.score, 100) + 0.35 * mlPct) : Math.min(rules.score, 100);
  // Never let the blend hide a strong rule hit or a very confident model.
  score = Math.max(score, Math.min(rules.score, 100) >= 50 ? 50 : 0);
  if (ml.available && ml.probability >= 0.9) score = Math.max(score, 30);
  const level = score >= 50 ? "high" : score >= 20 ? "medium" : "low";
  return {
    score,
    level,
    ruleScore: rules.score,
    detected: rules.detected,
    ml,
    advice: {
      high: "Do not reply, click links or share any codes. Delete the message and report it to your bank.",
      medium: "Be careful. Verify through the official number on your bank card or app before doing anything.",
      low: "No strong warning signs were found, but this does NOT mean the message is safe. Always verify through an official channel.",
    }[level],
    disclaimer:
      "ScamShield is a rule-based checker with an experimental model. It can miss scams and can raise false alarms - it never replaces your bank.",
  };
}

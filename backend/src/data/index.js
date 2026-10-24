import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));

export const seed = read("seed.json");
export const lessonData = read("lessons.json");
export const supportData = read("support.json");
export const scamEducation = read("scam-education.json");
export const scamRules = read("scam-rules.json");

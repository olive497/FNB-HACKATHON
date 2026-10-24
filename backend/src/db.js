// Tiny JSON-file store: zero native dependencies, so it installs cleanly on Windows.
// Fine for a hackathon demo; swap for Postgres/SQL Server later behind the same functions.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "./config.js";

export const uid = () => crypto.randomUUID();

let state = { users: [] };
let timer = null;

export function loadDb() {
  try {
    state = JSON.parse(fs.readFileSync(config.dbFile, "utf8"));
    if (!Array.isArray(state.users)) state = { users: [] };
  } catch {
    state = { users: [] };
  }
  return state;
}

function flush() {
  fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
  const tmp = config.dbFile + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, config.dbFile);
}

export function save() {
  clearTimeout(timer);
  timer = setTimeout(flush, 150);
}

export function saveNow() {
  clearTimeout(timer);
  flush();
}

export const users = () => state.users;
export const findUserById = (id) => state.users.find((u) => u.id === id);
export const findUserByEmail = (email) =>
  state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

export function insertUser(user) {
  state.users.push(user);
  save();
  return user;
}

export function resetForTests() {
  state = { users: [] };
}

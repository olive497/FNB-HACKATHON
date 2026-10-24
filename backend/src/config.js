import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  root,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "safebank-dev-secret-change-me",
  corsOrigins: (process.env.CORS_ORIGINS ??
    "http://localhost:3000,http://localhost:5173,http://localhost:8080")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  dbFile: process.env.DB_FILE ?? path.join(root, "data", "db.json"),
  modelFile: path.join(root, "model", "scam-model.json"),
};

import "express-async-errors";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/index.js";
import { auth } from "./routes/auth.js";
import { finance } from "./routes/finance.js";
import { learn } from "./routes/learn.js";
import { loadModel } from "./services/scam.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: config.corsOrigins, credentials: false }));
  app.use(express.json({ limit: "100kb" }));
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });

  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", service: "safebank-api", time: new Date().toISOString(), scamModel: Boolean(loadModel()) }),
  );
  app.use("/api/auth", auth);
  app.use("/api", learn);
  app.use("/api", finance);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

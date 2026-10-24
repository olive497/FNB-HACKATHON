import { createApp } from "./app.js";
import { config } from "./config.js";
import { loadDb, saveNow } from "./db.js";
import { loadModel } from "./services/scam.js";

loadDb();
const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`SafeBank API running on http://localhost:${config.port}/api`);
  console.log(loadModel() ? "ScamShield model: loaded" : "ScamShield model: NOT trained yet (run: npm run train) - rules still work");
});

const stop = () => { saveNow(); server.close(() => process.exit(0)); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { logger } from "./utils/logger";
import { validateBackendEnvVars } from "./utils/envValidation";
import { oracleBot } from "./bots/oracleBot";

// Routes
import marketsRouter from "./routes/markets";
import oracleRouter from "./routes/oracle";
import reputationRouter from "./routes/reputation";
import aggregationRouter from "./routes/aggregation";
import usersRouter from "./routes/users";
import aiRouter from "./routes/ai";
import venusRouter from "./routes/venus";
import gelatoRouter from "./routes/gelato";

// Load .env from root directory (2 levels up from src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate environment variables on startup
try {
  validateBackendEnvVars();
} catch (error: any) {
  logger.error(`[Startup] Environment validation failed: ${error.message}`);
  logger.error('[Startup] Please check your .env file and ensure all required variables are set');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/markets", marketsRouter);
app.use("/api/oracle", oracleRouter);
app.use("/api/reputation", reputationRouter);
app.use("/api/aggregation", aggregationRouter);
app.use("/api/users", usersRouter);
app.use("/api/ai", aiRouter);
app.use("/api/venus", venusRouter);
app.use("/api/gelato", gelatoRouter);

// Import insurance router
import insuranceRouter from "./routes/insurance";
app.use("/api/insurance", insuranceRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 MetaPredict.fun Backend running on port ${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
  
  // Start Oracle Bot
  try {
    await oracleBot.start();
    logger.info(`🤖 Oracle Bot started successfully`);
  } catch (error: any) {
    logger.error(`❌ Failed to start Oracle Bot: ${error.message}`);
    // Don't throw error so server continues running
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  oracleBot.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  oracleBot.stop();
  process.exit(0);
});

export default app;


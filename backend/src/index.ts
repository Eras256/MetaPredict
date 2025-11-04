import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./utils/logger";

// Routes
import marketsRouter from "./routes/markets";
import oracleRouter from "./routes/oracle";
import reputationRouter from "./routes/reputation";
import aggregationRouter from "./routes/aggregation";
import usersRouter from "./routes/users";

dotenv.config();

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

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 MetaPredict.ai Backend running on port ${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;


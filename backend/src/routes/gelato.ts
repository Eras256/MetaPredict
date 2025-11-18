import express from "express";
import { gelatoService } from "../services/gelatoService";
import { z } from "zod";

const router = express.Router();

/**
 * @route GET /api/gelato/status
 * @description Verifica la configuración de Gelato
 */
router.get("/status", async (req, res) => {
  try {
    const status = await gelatoService.checkConfiguration();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/gelato/bot-status
 * @description Obtiene el estado del Oracle Bot
 */
router.get("/bot-status", async (req, res) => {
  try {
    const { oracleBot } = await import("../bots/oracleBot");
    const status = oracleBot.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gelato/tasks
 * @description Crea una nueva tarea automatizada en Gelato
 */
router.post("/tasks", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string(),
      execAddress: z.string().startsWith("0x").length(42),
      execSelector: z.string().startsWith("0x"),
      execData: z.string().startsWith("0x"),
      interval: z.number().positive(),
      startTime: z.number().optional(),
      useTreasury: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);
    const task = await gelatoService.createTask(validated);
    res.json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/gelato/tasks/:taskId
 * @description Obtiene el estado de una tarea de Gelato
 */
router.get("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await gelatoService.getTaskStatus(taskId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/gelato/tasks/:taskId
 * @description Cancela una tarea de Gelato
 */
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const success = await gelatoService.cancelTask(taskId);
    res.json({ success, taskId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gelato/relay
 * @description Envía una transacción usando Gelato Relay (gasless)
 */
router.post("/relay", async (req, res) => {
  try {
    const schema = z.object({
      chainId: z.number(),
      target: z.string().startsWith("0x").length(42),
      data: z.string().startsWith("0x"),
      user: z.string().startsWith("0x").length(42).optional(),
    });

    const validated = schema.parse(req.body);
    const result = await gelatoService.relayTransaction(validated);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gelato/setup-oracle-automation
 * @description Configura automatización para el AIOracle usando Gelato
 */
router.post("/setup-oracle-automation", async (req, res) => {
  try {
    const schema = z.object({
      aiOracleAddress: z.string().startsWith("0x").length(42),
      backendUrl: z.string().url(),
      chainId: z.number().optional(),
    });

    const { aiOracleAddress, backendUrl, chainId } = schema.parse(req.body);
    const task = await gelatoService.setupOracleAutomation(
      aiOracleAddress,
      backendUrl,
      chainId || 5611
    );
    res.json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gelato/fulfill-resolution
 * @description Resuelve un mercado usando Gelato Relay después de obtener el resultado del backend
 */
router.post("/fulfill-resolution", async (req, res) => {
  try {
    const schema = z.object({
      aiOracleAddress: z.string().startsWith("0x").length(42),
      marketId: z.number(),
      outcome: z.number().min(1).max(3),
      confidence: z.number().min(0).max(100),
      chainId: z.number().optional(),
    });

    const { aiOracleAddress, marketId, outcome, confidence, chainId } = schema.parse(req.body);
    const result = await gelatoService.fulfillResolution(
      aiOracleAddress,
      marketId,
      outcome,
      confidence,
      chainId || 5611
    );
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;


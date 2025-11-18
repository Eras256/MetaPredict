import express from "express";
import { z } from "zod";
import { venusService } from "../services/venusService";

const router = express.Router();

/**
 * @route GET /api/venus/markets
 * @description Obtiene todos los mercados de Venus Protocol
 */
router.get("/markets", async (req, res) => {
  try {
    const markets = await venusService.getMarkets();
    res.json({ markets });
  } catch (error: any) {
    console.error("[Venus API] Error fetching markets:", error.message);
    res.status(500).json({ error: "Failed to fetch Venus markets", message: error.message });
  }
});

/**
 * @route GET /api/venus/markets/:address
 * @description Obtiene datos de un mercado específico por dirección del vToken
 */
router.get("/markets/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const market = await venusService.getMarketByAddress(address);
    
    if (!market) {
      return res.status(404).json({ error: "Market not found" });
    }
    
    res.json({ market });
  } catch (error: any) {
    console.error("[Venus API] Error fetching market:", error.message);
    res.status(500).json({ error: "Failed to fetch market", message: error.message });
  }
});

/**
 * @route GET /api/venus/vusdc
 * @description Obtiene información del vUSDC (vToken de USDC)
 */
router.get("/vusdc", async (req, res) => {
  try {
    const vUSDCInfo = await venusService.getVUSDCInfo();
    
    if (!vUSDCInfo) {
      return res.status(404).json({ error: "vUSDC not found" });
    }
    
    res.json({ vUSDCInfo });
  } catch (error: any) {
    console.error("[Venus API] Error fetching vUSDC info:", error.message);
    res.status(500).json({ error: "Failed to fetch vUSDC info", message: error.message });
  }
});

/**
 * @route GET /api/venus/apy/:address
 * @description Obtiene el APY actual de un vToken específico
 */
router.get("/apy/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const apy = await venusService.getVTokenAPY(address);
    res.json({ address, apy });
  } catch (error: any) {
    console.error("[Venus API] Error fetching APY:", error.message);
    res.status(500).json({ error: "Failed to fetch APY", message: error.message });
  }
});

/**
 * @route GET /api/venus/insurance-pool/apy
 * @description Obtiene el APY estimado para el Insurance Pool basado en el vUSDC
 */
router.get("/insurance-pool/apy", async (req, res) => {
  try {
    const apyData = await venusService.getInsurancePoolAPY();
    res.json(apyData);
  } catch (error: any) {
    console.error("[Venus API] Error fetching Insurance Pool APY:", error.message);
    res.status(500).json({ error: "Failed to fetch Insurance Pool APY", message: error.message });
  }
});

/**
 * @route GET /api/venus/history/:address
 * @description Obtiene datos históricos de APY de un vToken
 * @query startDate - Fecha de inicio (ISO string o timestamp)
 * @query endDate - Fecha de fin (ISO string o timestamp)
 */
router.get("/history/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = typeof startDate === "string" 
        ? new Date(startDate) 
        : new Date(Number(startDate));
    }

    if (endDate) {
      end = typeof endDate === "string" 
        ? new Date(endDate) 
        : new Date(Number(endDate));
    }

    const historicalData = await venusService.getHistoricalAPY(address, start, end);
    res.json({ address, historicalData });
  } catch (error: any) {
    console.error("[Venus API] Error fetching historical data:", error.message);
    res.status(500).json({ error: "Failed to fetch historical data", message: error.message });
  }
});

/**
 * @route GET /api/venus/history/:address/until
 * @description Obtiene datos históricos hasta noviembre 2025 (o fecha especificada)
 * @query endDate - Fecha límite (ISO string, default: 2025-11-30)
 */
router.get("/history/:address/until", async (req, res) => {
  try {
    const { address } = req.params;
    const { endDate } = req.query;

    const end = endDate 
      ? (typeof endDate === "string" ? new Date(endDate) : new Date(Number(endDate)))
      : new Date("2025-11-30");

    const historicalData = await venusService.getHistoricalDataUntil(address, end);
    res.json({ address, endDate: end.toISOString(), historicalData });
  } catch (error: any) {
    console.error("[Venus API] Error fetching historical data until date:", error.message);
    res.status(500).json({ error: "Failed to fetch historical data", message: error.message });
  }
});

/**
 * @route GET /api/venus/transactions
 * @description Obtiene transacciones relacionadas con Venus Protocol
 * @query address - Dirección del usuario o contrato
 * @query vTokenAddress - Dirección del vToken
 * @query limit - Límite de resultados (default: 50)
 * @query page - Página (default: 0)
 * @query startDate - Fecha de inicio
 * @query endDate - Fecha de fin
 */
router.get("/transactions", async (req, res) => {
  try {
    const { address, vTokenAddress, limit, page, startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = typeof startDate === "string" 
        ? new Date(startDate) 
        : new Date(Number(startDate));
    }

    if (endDate) {
      end = typeof endDate === "string" 
        ? new Date(endDate) 
        : new Date(Number(endDate));
    }

    const transactions = await venusService.getTransactions({
      address: address as string,
      vTokenAddress: vTokenAddress as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      startDate: start,
      endDate: end,
    });

    if (!transactions) {
      return res.status(404).json({ error: "Transactions endpoint not available" });
    }

    res.json({ transactions });
  } catch (error: any) {
    console.error("[Venus API] Error fetching transactions:", error.message);
    res.status(500).json({ error: "Failed to fetch transactions", message: error.message });
  }
});

/**
 * @route GET /api/venus/insurance-pool/transactions
 * @description Obtiene transacciones del Insurance Pool relacionadas con Venus
 * @query poolAddress - Dirección del Insurance Pool (opcional)
 * @query limit - Límite de resultados (default: 50)
 */
router.get("/insurance-pool/transactions", async (req, res) => {
  try {
    const { poolAddress, limit } = req.query;

    const transactions = await venusService.getInsurancePoolTransactions(
      poolAddress as string,
      limit ? Number(limit) : 50
    );

    if (!transactions) {
      return res.status(404).json({ error: "Transactions not found or endpoint not available" });
    }

    res.json({ transactions });
  } catch (error: any) {
    console.error("[Venus API] Error fetching insurance pool transactions:", error.message);
    res.status(500).json({ error: "Failed to fetch insurance pool transactions", message: error.message });
  }
});

export default router;


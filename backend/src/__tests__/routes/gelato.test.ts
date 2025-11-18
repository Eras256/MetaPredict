import request from 'supertest';
import express from 'express';
import gelatoRouter from '../../routes/gelato';
import { gelatoService } from '../../services/gelatoService';

// Mock the gelato service
jest.mock('../../services/gelatoService');

const app = express();
app.use(express.json());
app.use('/api/gelato', gelatoRouter);

describe('Gelato API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/gelato/status', () => {
    it('should return Gelato status', async () => {
      const mockStatus = { configured: true, apiKey: 'set' };

      (gelatoService.checkConfiguration as jest.Mock).mockResolvedValue(mockStatus);

      const response = await request(app).get('/api/gelato/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('configured');
    });
  });

  describe('POST /api/gelato/tasks', () => {
    it('should create a task', async () => {
      const taskData = {
        name: 'Test Task',
        execAddress: '0x1234567890123456789012345678901234567890',
        execSelector: '0x12345678',
        execData: '0x1234',
        interval: 3600,
      };

      const mockTask = { taskId: 'task-123', ...taskData };

      (gelatoService.createTask as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/gelato/tasks')
        .send(taskData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('taskId');
    });

    it('should validate task data', async () => {
      const invalidData = { name: 'Test' };

      const response = await request(app)
        .post('/api/gelato/tasks')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/gelato/tasks/:taskId', () => {
    it('should get task status', async () => {
      const mockStatus = { taskId: 'task-123', active: true };

      (gelatoService.getTaskStatus as jest.Mock).mockResolvedValue(mockStatus);

      const response = await request(app).get('/api/gelato/tasks/task-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('taskId');
    });
  });

  describe('POST /api/gelato/relay', () => {
    it('should relay transaction', async () => {
      const relayData = {
        chainId: 5611,
        target: '0x1234567890123456789012345678901234567890',
        data: '0x1234',
      };

      const mockResult = { taskId: 'relay-123' };

      (gelatoService.relayTransaction as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/gelato/relay')
        .send(relayData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('taskId');
    });
  });

  describe('POST /api/gelato/fulfill-resolution', () => {
    it('should fulfill resolution', async () => {
      const resolutionData = {
        aiOracleAddress: '0x1234567890123456789012345678901234567890',
        marketId: 1,
        outcome: 1,
        confidence: 85,
      };

      const mockResult = { success: true, txHash: '0x123' };

      (gelatoService.fulfillResolution as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/gelato/fulfill-resolution')
        .send(resolutionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });
});


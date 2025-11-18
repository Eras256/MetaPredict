import request from 'supertest';
import express from 'express';
import usersRouter from '../../routes/users';
import { userService } from '../../services/userService';

// Mock the user service
jest.mock('../../services/userService');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

describe('Users API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        walletAddress: '0x123',
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/user-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual(mockUser);
    });

    it('should return 404 when user not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        walletAddress: '0x123',
      };

      const mockUser = {
        id: 'user-123',
        ...userData,
      };

      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(userService.createUser).toHaveBeenCalledWith(
        userData.email,
        userData.walletAddress
      );
    });

    it('should handle errors when creating user', async () => {
      (userService.createUser as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com', walletAddress: '0x123' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});


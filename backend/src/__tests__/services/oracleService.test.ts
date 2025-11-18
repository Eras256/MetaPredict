import { oracleService } from '../../services/oracleService';

describe('Oracle Service', () => {
  describe('requestResolution', () => {
    it('should request market resolution', async () => {
      const result = await oracleService.requestResolution('market-123');

      expect(result).toHaveProperty('requestId');
      expect(result).toHaveProperty('marketId');
      expect(result).toHaveProperty('status');
      expect(result.marketId).toBe('market-123');
    });
  });

  describe('getOracleStatus', () => {
    it('should return oracle status', async () => {
      const status = await oracleService.getOracleStatus();

      expect(status).toHaveProperty('activeMarkets');
      expect(status).toHaveProperty('pendingResolutions');
      expect(status).toHaveProperty('totalResolved');
      expect(status).toHaveProperty('insurancePoolBalance');
    });
  });

  describe('fileDispute', () => {
    it('should file a dispute', async () => {
      const dispute = await oracleService.fileDispute(
        'market-123',
        'user-456',
        'Incorrect resolution'
      );

      expect(dispute).toHaveProperty('disputeId');
      expect(dispute).toHaveProperty('marketId');
      expect(dispute).toHaveProperty('challenger');
      expect(dispute.marketId).toBe('market-123');
      expect(dispute.challenger).toBe('user-456');
    });
  });
});


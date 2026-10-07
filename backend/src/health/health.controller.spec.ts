import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a healthy service response', async () => {
    const dataSource = { query: jest.fn().mockResolvedValue([{ ok: 1 }]) } as unknown as DataSource;
    const controller = new HealthController(dataSource);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('e-chowk-backend');
    expect(result.database).toBe('ok');
    expect(result.timestamp).toEqual(expect.any(String));
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });
});

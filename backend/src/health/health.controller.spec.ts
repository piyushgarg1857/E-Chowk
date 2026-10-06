import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a healthy service response', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('e-chowk-backend');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});

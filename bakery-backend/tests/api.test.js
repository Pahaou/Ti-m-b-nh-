const request = require('supertest');
const app = require('../server');

describe('API Health Check', () => {
    it('should return 200 OK for /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should return 200 OK for root', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});

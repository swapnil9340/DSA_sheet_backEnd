import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET /health returns a healthy service response', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
});

test('unknown endpoints return a stable JSON 404 error', async () => {
  const response = await request(app).get('/does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
});

test('registration rejects weak passwords before database access', async () => {
  const response = await request(app).post('/api/v1/auth/register').send({ name: 'Demo User', email: 'demo@example.com', password: 'short' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

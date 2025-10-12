
const request = require('supertest');
const express = require('express');
const mainRoutes = require('../routes/main');

const app = express();
app.use('/api', mainRoutes);

describe('Main Routes', () => {
  it('should return a health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });

  it('should return a test message', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('API is working!');
  });

  it('should return academy information', async () => {
    const res = await request(app).get('/api/academy-info');
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Farid Cadet Academy');
  });
});

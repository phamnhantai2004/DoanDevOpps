// <<<<<<< feature-qa-test1
// //Kiểm Thử Tự Động Độc Lập (Unit Testing )

// =======
// >>>>>>> backend
const test = require('node:test');
const assert = require('node:assert');
const healthRouter = require('../routes/health');

test('1. Verify health router module exports a function', () => {
  assert.strictEqual(typeof healthRouter, 'function', 'Health router should be an Express router function');
});

test('2. Verify health status response body structure', () => {
  const mockRes = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };

  const mockReq = {};
  
  // Invoke the health route handler directly
  healthRouter(mockReq, mockRes, () => {});

  // For a basic router health check, the handler is the first route stack item
  const healthHandler = healthRouter.stack[0].route.stack[0].handle;
  healthHandler(mockReq, mockRes);

  assert.deepStrictEqual(mockRes.jsonData, { ok: true }, 'Health check response should be { ok: true }');
});

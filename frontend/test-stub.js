import assert from 'assert';
import * as api from './src/api.js';

console.log('🧪 Running frontend API client module tests...');

assert.strictEqual(typeof api.getEvents, 'function', 'getEvents should be a function');
assert.strictEqual(typeof api.getUsers, 'function', 'getUsers should be a function');
assert.strictEqual(typeof api.getMe, 'function', 'getMe should be a function');

console.log('✅ Frontend test stub passed successfully!');

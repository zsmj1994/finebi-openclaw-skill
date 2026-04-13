import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import * as fs from 'fs';

// We need to mock some things before importing helpers if they run side effects
// However, parseResponseData is a pure function, we can test it easily.
// For functions like getConfig, we might need to mock process.env

import { getConfig, parseResponseData } from '../src/helpers.js';

describe('Helpers - parseResponseData', () => {
  it('should parse simple JSON strings', () => {
    expect(parseResponseData('{"a": 1}')).toEqual({ a: 1 });
  });

  it('should parse callback JSONP strings', () => {
    expect(parseResponseData('callback({"b": 2})')).toEqual({ b: 2 });
  });

  it('should parse jsonp_123 strings', () => {
    expect(parseResponseData('jsonp_12345({"c": 3})')).toEqual({ c: 3 });
  });

  it('should return raw string if not JSON', () => {
    expect(parseResponseData('not a json')).toBe('not a json');
  });

  it('should handle non-string inputs', () => {
    expect(parseResponseData(123)).toBe(123);
    expect(parseResponseData({ d: 4 })).toEqual({ d: 4 });
  });
});

describe('Helpers - getConfig', () => {
  it('should throw error if environment variables are missing', async () => {
    const originalEnv = { ...process.env };
    process.env.FINEBI_BASE_URL = '';
    process.env.FINEBI_USERNAME = '';
    process.env.FINEBI_PASSWORD = '';

    await expect(getConfig()).rejects.toThrow('Missing required environment variables');

    process.env = originalEnv;
  });

  it('should return config if environment variables are present', async () => {
    const originalEnv = { ...process.env };
    process.env.FINEBI_BASE_URL = 'http://test.com';
    process.env.FINEBI_USERNAME = 'admin';
    process.env.FINEBI_PASSWORD = 'password';

    const config = await getConfig();
    expect(config).toEqual({
      baseUrl: 'http://test.com',
      username: 'admin',
      password: 'password'
    });

    process.env = originalEnv;
  });
});

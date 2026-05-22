import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';

const axiosMock = vi.hoisted(() => {
  const fn = vi.fn();
  Object.assign(fn, {
    get: vi.fn(),
  });
  return fn;
});

vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

vi.mock('axios', () => ({
  default: axiosMock,
}));

import {
  fineBIAuthFetch,
  getConfig,
  getDefaultConfigDir,
  getDefaultEnvPath,
  getEnvSearchPaths,
  parseResponseData,
  resetConfigCache,
} from '../src/helpers.js';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  resetConfigCache();
  vi.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.FINEBI_BASE_URL;
  delete process.env.FINE_ACCESS_TOKEN;
  delete process.env.FINEBI_USERNAME;
  delete process.env.FINEBI_PASSWORD;
  delete process.env.FINEBI_LIGHT_AUTH_TOKEN;
  delete process.env.FINE_AUTH_TOKEN;
});

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
  it('should expose a stable user-level config directory', () => {
    expect(getDefaultConfigDir()).toBe(path.join(os.homedir(), '.finebi-cli'));
    expect(getDefaultEnvPath()).toBe(path.join(os.homedir(), '.finebi-cli', '.env'));
  });

  it('should throw error if the new auth environment variables are missing', async () => {
    await expect(getConfig()).rejects.toThrow('Missing required environment variables');
  });

  it('should return config when FINEBI_BASE_URL and FINE_ACCESS_TOKEN are present', async () => {
    process.env.FINEBI_BASE_URL = 'http://test.com';
    process.env.FINE_ACCESS_TOKEN = 'access-key-123';

    const config = await getConfig();

    expect(config).toEqual({
      baseUrl: 'http://test.com',
      accessToken: 'access-key-123',
    });
  });

  it('should search the user-level env file after cwd .env', () => {
    const paths = getEnvSearchPaths('/repo/packages/finebicli/src');
    expect(paths[0]).toBe(path.join(process.cwd(), '.env'));
    expect(paths[1]).toBe(getDefaultEnvPath());
  });
});

describe('Helpers - fineBIAuthFetch', () => {
  it('should send X-Fine-Access-Key with the configured access token', async () => {
    process.env.FINEBI_BASE_URL = 'http://test.com';
    process.env.FINE_ACCESS_TOKEN = 'access-key-123';
    axiosMock.mockResolvedValueOnce({
      data: { success: true },
    });

    await fineBIAuthFetch('/v5/api/dashboard/user/info', { method: 'GET' });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://test.com/v5/api/dashboard/user/info',
        method: 'GET',
        headers: expect.objectContaining({
          'X-Fine-Access-Key': 'access-key-123',
        }),
      })
    );
  });
});

import { describe, it, expect, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Mock dependencies
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import {
  getConfig,
  parseResponseData,
  getToken,
  resetConfigCache,
  getDefaultConfigDir,
  getDefaultEnvPath,
  getEnvSearchPaths,
} from '../src/helpers.js';
import { beforeEach as beforeEachGlobal } from 'vitest';

beforeEachGlobal(() => {
  resetConfigCache();
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
    delete process.env.FINEBI_LIGHT_AUTH_TOKEN;

    const config = await getConfig();
    expect(config).toEqual({
      baseUrl: 'http://test.com',
      username: 'admin',
      password: 'password',
      lightAuthToken: undefined
    });

    process.env = originalEnv;
  });

  it('should return config with lightAuthToken if present', async () => {
    const originalEnv = { ...process.env };
    process.env.FINEBI_BASE_URL = 'http://test.com';
    process.env.FINEBI_USERNAME = 'admin';
    process.env.FINEBI_PASSWORD = 'password';
    process.env.FINEBI_LIGHT_AUTH_TOKEN = 'light-token-123';

    const config = await getConfig();
    expect(config).toEqual({
      baseUrl: 'http://test.com',
      username: 'admin',
      password: 'password',
      lightAuthToken: 'light-token-123'
    });

    process.env = originalEnv;
  });

  it('should search the user-level env file after cwd .env', () => {
    const paths = getEnvSearchPaths('/repo/packages/finebicli/src');
    expect(paths[0]).toBe(path.join(process.cwd(), '.env'));
    expect(paths[1]).toBe(getDefaultEnvPath());
  });
});

describe('Helpers - getToken', () => {
  const config = {
    baseUrl: 'http://test.com',
    username: 'admin',
    password: 'password'
  };

  it('should use standard login if lightAuthToken is not present', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: '{"accessToken": "base-token-123"}',
      config: { params: {} }
    } as any);

    const token = await getToken(config, true);
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/login/cross/domain'),
      expect.objectContaining({
        params: expect.objectContaining({ fine_username: 'admin' })
      })
    );
    expect(token).toBe('base-token-123');
  });

  it('should use light auth if lightAuthToken is present', async () => {
    const lightConfig = { ...config, lightAuthToken: 'light-123' };
    
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: '{"data": "light-token-456"}',
      config: { params: {} }
    } as any);

    const token = await getToken(lightConfig, true);
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/plugin/fine-light-auth-token/login'),
      expect.objectContaining({
        params: expect.objectContaining({ "fine-light-auth-token": 'light-123' })
      })
    );
    expect(token).toBe('light-token-456');
  });
});

/**
 * Internal HTTP helpers for communicating with the FineBI API.
 */

import axios from "axios";
import { type FineBIConfig, type ExportResult, type ToolResult, FineBIErrorCode } from "./types.js";

import * as dotenv from "dotenv";

import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export async function getConfig(): Promise<FineBIConfig> {
  const envFiles = [
    path.join(process.cwd(), ".env"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }

  // Also generic dotenv load
  dotenv.config();

  const baseUrl = process.env["FINEBI_BASE_URL"];
  const username = process.env["FINEBI_USERNAME"];
  const password = process.env["FINEBI_PASSWORD"];

  if (!baseUrl || !username || !password) {
    // We don't throw here anymore, let the CLI or caller handle the missing config message
    return {
      baseUrl: baseUrl || "",
      username: username || "",
      password: password || "",
    };
  }

  return { baseUrl, username, password };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseResponseData(rawData: any): any {
  if (typeof rawData === "string") {
    rawData = rawData.trim();
    const match = rawData.match(/^callback\((.*)\)$/sm) || rawData.match(/^jsonp_\d+\((.*)\)$/sm);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        return rawData;
      }
    }
    try {
      return JSON.parse(rawData);
    } catch (e) {
      return rawData;
    }
  }
  return rawData;
}

// ---------------------------------------------------------------------------
// Unauthenticated fetch
// ---------------------------------------------------------------------------

export async function fineBIFetch(
  config: FineBIConfig,
  path: string,
  options?: { method?: "GET" | "POST" | "PUT" | "DELETE"; data?: unknown; headers?: Record<string, string> }
): Promise<unknown> {
  const url = `${config.baseUrl}${path}`;
  console.log(url);
  const response = await axios({
    url,
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options?.headers,
    },
    data: options?.data,
  });

  return parseResponseData(response.data);
}

// ---------------------------------------------------------------------------
// Token retrieval & caching
// ---------------------------------------------------------------------------
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const TOKEN_CACHE_PATH = path.join(os.tmpdir(), "finebi-token-cache.json");

let cachedToken: string | null = null;

function loadPersistedToken(): string | null {
  try {
    if (fs.existsSync(TOKEN_CACHE_PATH)) {
      const data = fs.readFileSync(TOKEN_CACHE_PATH, "utf-8");
      return JSON.parse(data).accessToken || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function savePersistedToken(token: string) {
  try {
    fs.writeFileSync(TOKEN_CACHE_PATH, JSON.stringify({ accessToken: token }), "utf-8");
  } catch {
    // ignore
  }
}

/**
 * Log in to FineBI via axios and return the access token string.
 * Used internally by authenticated helpers.
 */
export async function getToken(config: FineBIConfig, forceRefresh = false): Promise<string> {
  if (!cachedToken) {
    cachedToken = loadPersistedToken();
  }

  if (cachedToken && !forceRefresh) {
    return cachedToken;
  }

  const response = await axios.get(
    `${config.baseUrl}/webroot/decision/login/cross/domain`,
    {
      params: {
        fine_username: config.username,
        fine_password: config.password,
        validity: -1,
      },
      responseType: "text",
    }
  );

  const data = parseResponseData(response.data) as { accessToken?: string; errorCode?: string; errorMsg?: string };
  if (data.errorCode || !data.accessToken) {
    throw new Error(`FineBI login failed: ${data.errorMsg ?? "unknown error"} (code: ${data.errorCode})`);
  }

  cachedToken = data.accessToken;
  savePersistedToken(cachedToken);
  return cachedToken;
}

// ---------------------------------------------------------------------------
// Authenticated fetch
// ---------------------------------------------------------------------------

/**
 * Perform an authenticated JSON request to the FineBI API.
 * Automatically logs in and includes the access token. Handles token expiration.
 */
export async function fineBIAuthFetch(
  config: FineBIConfig,
  path: string,
  options?: { method?: "GET" | "POST" | "PUT" | "DELETE"; data?: unknown; headers?: Record<string, string> }
): Promise<unknown> {
  const url = `${config.baseUrl}${path}`;
  console.log(url);
  const makeRequest = async (token: string) => {
    return axios({
      url,
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      data: options?.data,
      params: {
        fine_auth_token: token,
      },
    });
  };

  let token = await getToken(config);
  try {
    let response = await makeRequest(token);
    let parsedData = parseResponseData(response.data);

    // Check if token expired inside HTTP 200 response
    if (parsedData && [FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_IS_NULL].includes(parsedData.errorCode)) {
      token = await getToken(config, true);
      response = await makeRequest(token);
      parsedData = parseResponseData(response.data);
    }

    return parsedData;
  } catch (error: any) {
    // Also check if token expired inside an HTTP error response
    let errorData = error.response?.data ? parseResponseData(error.response.data) : null;
    if (errorData?.errorCode && [FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_IS_NULL].includes(errorData.errorCode)) {
      console.log("Token expired, refreshing token...");
      token = await getToken(config, true);
      const response = await makeRequest(token);
      return parseResponseData(response.data);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Authenticated binary download
// ---------------------------------------------------------------------------

/**
 * Perform an authenticated binary download request to the FineBI API.
 * Returns the response as an ArrayBuffer with content type information.
 */
export async function fineBIAuthDownload(
  config: FineBIConfig,
  path: string
): Promise<ExportResult> {
  const url = `${config.baseUrl}${path}`;

  const makeRequest = async (token: string) => {
    return axios.get(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${token}`,
      },
      params: {
        fine_auth_token: token,
      },
      responseType: "arraybuffer", // expecting binary
    });
  };

  let token = await getToken(config);
  let response;

  try {
    response = await makeRequest(token);
  } catch (error: any) {
    let isTokenExpired = false;
    if (error.response?.data instanceof ArrayBuffer || Buffer.isBuffer(error.response?.data) || error.response?.data instanceof Uint8Array) {
      try {
        const text = new TextDecoder().decode(error.response.data);
        const jsonData = JSON.parse(text);
        if ([FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_IS_NULL].includes(jsonData.errorCode)) {
          isTokenExpired = true;
        }
      } catch (e) {
        // Not a JSON response inside ArrayBuffer error
      }
    } else if (error.response?.data?.errorCode && [FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_IS_NULL].includes(error.response.data.errorCode)) {
      isTokenExpired = true;
    }

    if (isTokenExpired) {
      token = await getToken(config, true);
      response = await makeRequest(token);
    } else {
      throw error;
    }
  }

  console.log(response.headers["content-type"]);

  // Even if HTTP status is 200, the body might be JSON containing the token error
  let contentType = (response.headers["content-type"] as string) ?? "application/octet-stream";
  if (response.data instanceof ArrayBuffer || Buffer.isBuffer(response.data) || response.data instanceof Uint8Array) {
    try {
      const text = new TextDecoder().decode(response.data);
      const parsedData = parseResponseData(text);
      if (parsedData && [FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_IS_NULL].includes(parsedData.errorCode)) {
        token = await getToken(config, true);
        response = await makeRequest(token);
        contentType = (response.headers["content-type"] as string) ?? "application/octet-stream";
        
        // Double check after retry
        if (response.data instanceof ArrayBuffer || Buffer.isBuffer(response.data) || response.data instanceof Uint8Array) {
          const retryText = new TextDecoder().decode(response.data);
          const retryData = parseResponseData(retryText);
          if (retryData && retryData.errorCode) {
            throw new Error(`FineBI request failed: ${retryData.errorMsg ?? "unknown"} (code: ${retryData.errorCode})`);
          }
        }
      } else if (parsedData && parsedData.errorCode) {
        throw new Error(`FineBI request failed: ${parsedData.errorMsg ?? "unknown"} (code: ${parsedData.errorCode})`);
      }
    } catch (e) {
      // Ignored if not JSON or text decode fails
    }
  }

  const disposition = response.headers["content-disposition"] as string | undefined;
  let filename: string | undefined;

  if (disposition) {
    // First try the RFC 5987 format (filename*=UTF-8''...)
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        filename = decodeURIComponent(utf8Match[1]);
      } catch {
        filename = utf8Match[1];
      }
    } else {
      // Fallback to the regular filename="..."
      const match = disposition.match(/filename=(?:"([^"]+)"|([^;]+))/i);
      let rawFilename = match?.[1] || match?.[2];
      if (rawFilename) {
        // Axios parses headers as latin1. The server may have sent UTF-8 bytes directly.
        try {
          const bufferDecoded = Buffer.from(rawFilename, "latin1").toString("utf8");
          // \ufffd is the unicode replacement character for un-decodable bytes
          if (bufferDecoded.includes("\ufffd")) {
            filename = decodeURIComponent(rawFilename);
          } else {
            filename = bufferDecoded;
          }
        } catch {
          filename = rawFilename;
        }
      }
    }
  }

  const content = response.data as ArrayBuffer;
  return { content, contentType, filename };
}

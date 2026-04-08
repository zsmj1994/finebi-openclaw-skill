/**
 * Internal HTTP helpers for communicating with the FineBI API.
 */

import axios from "axios";
import { type FineBIConfig, type ExportResult, FineBIErrorCode } from "./types.js";

import * as dotenv from "dotenv";

import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export async function getConfig(): Promise<FineBIConfig> {
  // Try to load from the project root .env first (when installed globally)
  if (import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.join(__dirname, "../.env") });
  }

  // Also try to load from current working directory as a fallback
  dotenv.config();

  const baseUrl = process.env["FINEBI_BASE_URL"];
  const username = process.env["FINEBI_USERNAME"];
  const password = process.env["FINEBI_PASSWORD"];

  if (!baseUrl || !username || !password) {
    throw new Error(
      "Missing required environment variables: FINEBI_BASE_URL, FINEBI_USERNAME, FINEBI_PASSWORD"
    );
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

  console.log(response.config.params)

  const data = parseResponseData(response.data) as { accessToken?: string; errorCode?: string; errorMsg?: string };
  if (data.errorCode || !data.accessToken) {
    throw new Error(`FineBI login failed: username : ${config.username} ${data.errorMsg ?? "unknown error"} (code: ${data.errorCode})`);
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
    });
  };

  let token = await getToken(config);
  try {
    let response = await makeRequest(token);
    let parsedData = parseResponseData(response.data);

    // Check if token expired inside HTTP 200 response
    if (parsedData && [FineBIErrorCode.TOKEN_EXPIRED, FineBIErrorCode.LOGIN_INFO_NULL, FineBIErrorCode.LOGIN_FAILED].includes(parsedData.errorCode)) {
      token = await getToken(config, true);
      response = await makeRequest(token);
      parsedData = parseResponseData(response.data);
    }

    return parsedData;
  } catch (error: any) {
    // Also check if token expired inside an HTTP error response
    let errorData = error.response?.data ? parseResponseData(error.response.data) : null;
    if (errorData?.errorCode === FineBIErrorCode.TOKEN_EXPIRED) {
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
      responseType: "arraybuffer", // expecting binary
    });
  };

  let token = await getToken(config);
  let response;

  try {
    response = await makeRequest(token);
  } catch (error: any) {
    let isTokenExpired = false;
    if (error.response?.data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(error.response.data);
        const jsonData = JSON.parse(text);
        if (jsonData.errorCode === FineBIErrorCode.TOKEN_EXPIRED) {
          isTokenExpired = true;
        }
      } catch (e) {
        // Not a JSON response inside ArrayBuffer error
      }
    } else if (error.response?.data?.errorCode === FineBIErrorCode.TOKEN_EXPIRED) {
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
  if (contentType.includes("application/json") && response.data instanceof ArrayBuffer) {
    const text = new TextDecoder().decode(response.data);
    try {
      const jsonData = JSON.parse(text);
      if (jsonData.errorCode === FineBIErrorCode.TOKEN_EXPIRED) {
        token = await getToken(config, true);
        response = await makeRequest(token);
        contentType = (response.headers["content-type"] as string) ?? "application/octet-stream";
      }
    } catch (e) {
      // Not JSON or parse failed
    }
  }

  const disposition = response.headers["content-disposition"] as string | undefined;
  let filename: string | undefined;
  if (disposition) {
    // Match filename from Content-Disposition header
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?(.*?)(?:"|;|$)/i);
    if (match?.[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  const content = response.data as ArrayBuffer;
  return { content, contentType, filename };
}

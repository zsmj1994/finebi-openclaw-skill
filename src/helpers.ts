/**
 * Internal HTTP helpers for communicating with the FineBI API.
 */

import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { type FineBIConfig, type ExportResult, FineBIErrorCode } from "./types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

let cachedConfig: FineBIConfig | null = null;

/**
 * Clear the cached configuration.
 */
export function resetConfigCache() {
  cachedConfig = null;
}

export async function getConfig(): Promise<FineBIConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Load from the project root .env
  if (import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.join(__dirname, "../.env") });
  }

  const baseUrl = process.env["FINEBI_BASE_URL"];
  const username = process.env["FINEBI_USERNAME"];
  const password = process.env["FINEBI_PASSWORD"];
  const lightAuthToken = process.env["FINEBI_LIGHT_AUTH_TOKEN"];

  if (!baseUrl || ((!username || !password) && !lightAuthToken)) {
    throw new Error(
      "Missing required environment variables: FINEBI_BASE_URL, and either (FINEBI_USERNAME + FINEBI_PASSWORD) or FINEBI_LIGHT_AUTH_TOKEN"
    );
  }

  cachedConfig = { baseUrl, username, password, lightAuthToken };
  return cachedConfig;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseResponseData(rawData: any): any {
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
// Token retrieval & caching
// ---------------------------------------------------------------------------

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

  let response;
  if (config.lightAuthToken) {
    // Priority: use Light Auth Token if provided
    response = await axios.get(
      `${config.baseUrl}/plugin/fine-light-auth-token/login`,
      {
        params: {
          "fine-light-auth-token": config.lightAuthToken,
        },
        responseType: "text",
      }
    );
  } else {
    // Fallback: standard login
    response = await axios.get(
      `${config.baseUrl}/login/cross/domain`,
      {
        params: {
          fine_username: config.username,
          fine_password: config.password,
          validity: -1,
        },
        responseType: "text",
      }
    );
  }

  const resData = parseResponseData(response.data) as { accessToken?: string; data?: string; errorCode?: string; errorMsg?: string };
  const accessToken = config.lightAuthToken ? resData.data : resData.accessToken;

  if (resData.errorCode || !accessToken) {
    const authType = config.lightAuthToken ? "Light Auth" : `User: ${config.username}`;
    throw new Error(`FineBI login failed (${authType}): ${resData.errorMsg ?? "unknown error"} (code: ${resData.errorCode})`);
  }

  cachedToken = accessToken;
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
  path: string,
  options?: { method?: "GET" | "POST" | "PUT" | "DELETE"; data?: unknown; headers?: Record<string, string> },
  configParam?: FineBIConfig
): Promise<unknown> {
  const config = configParam || await getConfig();
  const url = `${config.baseUrl}${path}`;

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
  console.log(url, token);
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
  path: string,
  configParam?: FineBIConfig
): Promise<ExportResult> {
  const config = configParam || await getConfig();
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

  const rawDisposition = response.headers["content-disposition"] as string | undefined;
  let filename: string | undefined;

  if (rawDisposition) {
    // 1. Fix common Node.js issue: headers are parsed as ISO-8859-1 (Latin1)
    // even if they contain UTF-8 bytes.
    const disposition = Buffer.from(rawDisposition, "binary").toString("utf8");

    // 2. Try filename* (RFC 5987)
    const starMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/i);
    if (starMatch) {
      try {
        filename = decodeURIComponent(starMatch[1]);
      } catch {
        filename = starMatch[1];
      }
    }

    // 3. Fallback to regular filename
    if (!filename) {
      const match = disposition.match(/filename=(?:"(.+?)"|([^;]+))/i);
      if (match) {
        const raw = (match[1] || match[2]).trim();
        // If the server mistakenly URL-encoded the 'filename' parameter
        if (raw.includes("%")) {
          try {
            filename = decodeURIComponent(raw);
          } catch {
            filename = raw;
          }
        } else {
          filename = raw;
        }
      }
    }
  }

  const content = response.data as ArrayBuffer;
  return { content, contentType, filename };
}

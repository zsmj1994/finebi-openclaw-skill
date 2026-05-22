/**
 * Internal HTTP helpers for communicating with the FineBI API.
 */

import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import { type FineBIConfig, type ExportResult } from "./types.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

let cachedConfig: FineBIConfig | null = null;

export function getDefaultConfigDir(): string {
  return path.join(os.homedir(), ".finebi-cli");
}

export function getDefaultEnvPath(): string {
  return path.join(getDefaultConfigDir(), ".env");
}

export function getEnvSearchPaths(currentFileDir: string): string[] {
  return [
    path.join(process.cwd(), ".env"),
    getDefaultEnvPath(),
    path.join(currentFileDir, "../.env"),
    path.join(currentFileDir, "../../.env"),
  ];
}

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

  if (import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    for (const envPath of getEnvSearchPaths(__dirname)) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        break;
      }
    }
  }

  const baseUrl = process.env["FINEBI_BASE_URL"];
  const accessToken = process.env["FINE_ACCESS_TOKEN"];

  console.log("Loaded configuration:");
  console.log(`FINEBI_BASE_URL: ${baseUrl ? baseUrl : "Not Set"}`);
  console.log(`FINE_ACCESS_TOKEN: ${accessToken ? "[REDACTED]" : "Not Set"}`);

  if (!baseUrl || !accessToken) {
    throw new Error(
      "Missing required environment variables: FINEBI_BASE_URL and FINE_ACCESS_TOKEN"
    );
  }

  cachedConfig = { baseUrl, accessToken };
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
// Authenticated fetch
// ---------------------------------------------------------------------------

/**
 * Perform an authenticated JSON request to the FineBI API.
 */
export async function fineBIAuthFetch(
  path: string,
  options?: { method?: "GET" | "POST" | "PUT" | "DELETE"; data?: unknown; headers?: Record<string, string> },
  configParam?: FineBIConfig
): Promise<unknown> {
  const config = configParam || await getConfig();
  const url = `${config.baseUrl}${path}`;

  const response = await axios({
    url,
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Fine-Access-Key": config.accessToken,
      ...options?.headers,
    },
    data: options?.data,
  });

  return parseResponseData(response.data);
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

  const response = await axios.get(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "X-Fine-Access-Key": config.accessToken,
    },
    responseType: "arraybuffer",
  });

  console.log(response.headers["content-type"]);

  const contentType = (response.headers["content-type"] as string) ?? "application/octet-stream";
  const rawDisposition = response.headers["content-disposition"] as string | undefined;
  let filename: string | undefined;

  if (rawDisposition) {
    const disposition = Buffer.from(rawDisposition, "binary").toString("utf8");

    const starMatch = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/i);
    if (starMatch) {
      try {
        filename = decodeURIComponent(starMatch[1]);
      } catch {
        filename = starMatch[1];
      }
    }

    if (!filename) {
      const match = disposition.match(/filename=(?:"(.+?)"|([^;]+))/i);
      if (match) {
        const raw = (match[1] || match[2]).trim();
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

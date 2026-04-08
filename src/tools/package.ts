import type { ToolResult } from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";

/**
 * Get first-level folders (GET /packs/folders).
 */
export async function packageList(): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/packs/folders`, {
      method: "GET"
    });
    return { success: true, data: result as any };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get folder hierarchy without tables (GET /packs/structure/{packId}).
 */
export async function packageStructure(packId: string, withTables: boolean): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const q = new URLSearchParams();
    const params = { include_tables: withTables };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
    }
    const result = await fineBIAuthFetch(config, `/v5/conf/packs/structure/${packId}?${q.toString()}`, {
      method: "GET"
    });
    return { success: true, data: result as any };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

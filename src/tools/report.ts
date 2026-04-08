import type { ToolResult } from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";

/**
 * List reports for a given subject.
 */
export async function reportList(subjectId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const q = new URLSearchParams();
    const params = { subjectId };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
    }
    const result = await fineBIAuthFetch(config, `/v5/api/platform/dashboard/list?${q.toString()}`, {
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
 * Get detailed information for one or more reports.
 */
export async function reportInfo(reportIds: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const q = new URLSearchParams();
    const params = { info: reportIds };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
    }
    const result = await fineBIAuthFetch(config, `/v5/api/platform/dashboard/reports/info?${q.toString()}`, {
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
 * Get report lineage / consanguinity analysis.
 */
export async function reportConsanguinity(reportId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const q = new URLSearchParams();
    const params = { reportId };
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) q.set(k, String(v));
    }
    const result = await fineBIAuthFetch(config, `/v5/api/dashboard/report/consanguinity?${q.toString()}`, {
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
 * Check report state.
 */
export async function reportCheck(): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/dashboard/report/check`, {
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

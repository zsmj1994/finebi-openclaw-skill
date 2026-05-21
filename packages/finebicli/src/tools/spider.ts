import type { ToolResult } from "../types.js";
import { fineBIAuthFetch } from "../helpers.js";

/**
 * Get the status of a spider update task instance.
 */
export async function spiderStatus(taskInstanceId: string): Promise<ToolResult<any>> {
  try {
    const result = await fineBIAuthFetch(`/v5/api/conf/update/instance/${taskInstanceId}`, {
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

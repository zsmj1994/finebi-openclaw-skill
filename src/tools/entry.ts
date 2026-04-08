import { getConfig, fineBIAuthFetch } from "../helpers.js";
import type { ToolResult, EntryTreeNode } from "../types.js";

/**
 * Get the directory tree the user has permission to view.
 * GET /v10/view/entry/tree
 * 
 * @returns An array of directory tree nodes.
 */
export async function getEntryTree(): Promise<ToolResult<EntryTreeNode[]>> {
  try {
    const config = await getConfig();
    const url = "/v10/view/entry/tree";
    const data = await fineBIAuthFetch(config, url, {
      method: "GET",
    }) as EntryTreeNode[];
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

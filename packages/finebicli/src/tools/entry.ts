import { fineBIAuthFetch } from "../helpers.js";
import type { ToolResult, EntryTreeNode } from "../types.js";

/**
 * Get the directory tree the user has permission to view.
 * GET /v10/view/entry/tree
 * 
 * @returns An array of directory tree nodes.
 */
export async function getEntryTree(keyword?: string): Promise<ToolResult<EntryTreeNode[]>> {
  try {
    const url = "/v10/view/entry/tree";
    const data = await fineBIAuthFetch(url, {
      method: "GET",
    }) as { data: EntryTreeNode[] };
    let nodes = data.data.filter(node => node.entryType === 201);
    if (keyword) {
      const lower = keyword.toLowerCase();
      nodes = nodes.filter(node => node.text?.toLowerCase().includes(lower));
    }
    return { success: true, data: nodes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

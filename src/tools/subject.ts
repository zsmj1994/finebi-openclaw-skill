import type { ToolResult, PublishedSubjectResource, SubjectEditSession } from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";

/**
 * Get first-level folders in 'My Analysis' (GET /subjects/first/folders).
 */
export async function subjectFolders(): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/first/folders`, {
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
 * Get the top-level subject tree (GET /subjects/tree).
 */
export async function subjectTreeRoot(): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/tree`, {
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
 * Get contents of a folder (sub-folders + subjects) (GET /subjects/folders/{folderId}).
 */
export async function subjectFolder(folderId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/folders/${folderId}`, {
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
 * Get full tree (with tables) under a folder/subject (GET /subjects/folders/tree/{folderId}).
 */
export async function subjectTree(folderId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/folders/tree/${folderId}`, {
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
 * Get all items (datasets, components, dashboards) in a subject (GET /subjects/{subjectId}).
 */
export async function subjectContent(subjectId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/${subjectId}`, {
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
 * Get all dashboards in a subject (GET /subjects/{subjectId}/reports).
 */
export async function subjectReports(subjectId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/${subjectId}/reports`, {
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
 * Batch-fetch subject info by IDs (POST /subjects/get).
 */
export async function subjectGet(subjectIds: string[]): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/get`, {
      method: "POST",
      data: { subjectIds }
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
 * Search subjects/folders within a subject (POST /conf/subjects/search).
 */
export async function subjectSearch(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/search`, {
      method: "POST",
      data: body
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
 * Search across all subjects/folders (POST /conf/subjects/groups/search).
 */
export async function subjectGroupsSearch(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/groups/search`, {
      method: "POST",
      data: body
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
 * Get lineage/consanguinity within a subject (GET /subjects/consanguinity/{subjectId}).
 */
export async function subjectConsanguinity(subjectId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/conf/subjects/consanguinity/${subjectId}`, {
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
 * According to the directory node's templateId, query the resources exposed by the published analysis subject.
 * POST /v5/conf/publish/subjects/publish/resource
 * 
 * @param publishTaskId The templateId/publishTaskId
 * @returns The published subject resources
 */
export async function getPublishedSubjectResources(publishTaskId: string): Promise<ToolResult<PublishedSubjectResource>> {
  try {
    const config = await getConfig();
    const url = "/v5/conf/publish/subjects/publish/resource";
    const data = await fineBIAuthFetch(config, url, {
      method: "POST",
      data: { publishTaskId },
    }) as PublishedSubjectResource;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Enter a subject edit session.
 * GET /v5/cache/subjects/{subjectId}/enter
 * 
 * @param subjectId The subject ID
 * @returns The subject edit session info
 */
export async function enterSubjectEdit(subjectId: string): Promise<ToolResult<SubjectEditSession>> {
  try {
    const config = await getConfig();
    const url = `/v5/cache/subjects/${encodeURIComponent(subjectId)}/enter`;
    const response = await fineBIAuthFetch(config, url, {
      method: "GET"
    }) as any;
    // Handle structure where data is nested or at root
    const data = response.data || response;
    return { success: true, data: data as SubjectEditSession };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

import type { ToolResult } from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";



/**
 * Get preview data for a table.
 */
export async function dataTablePreview(tableName: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/tables/${encodeURIComponent(tableName)}/data`, {
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
 * Get the schema/structure of a table.
 */
export async function dataTableStructure(tableName: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/tables/${encodeURIComponent(tableName)}/structure`, {
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
 * Get a data model by ID.
 */
export async function dataModel(modelId: string): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/model/${modelId}/structure`, {
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
 * Execute a data model query.
 */
export async function dataQuery(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/data/model`, {
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
 * Preview data with pagination.
 */
export async function dataPreview(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/preview/page`, {
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
 * Search tables by keyword.
 */
export async function dataSearchTables(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/folders/table/search`, {
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
 * Search fields by keyword.
 */
export async function dataSearchFields(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/folders/field/search`, {
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
 * Get field data values.
 */
export async function dataFieldData(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/field/data`, {
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
 * Get the range (min/max) of a field.
 */
export async function dataFieldRange(body: any): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const result = await fineBIAuthFetch(config, `/v5/api/field/range`, {
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

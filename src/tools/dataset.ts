/**
 * Dataset and report tools for FineBI.
 */

import type {
  Dataset,
  QueryResult,
  CreateReportParams,
  Report,
  ToolResult,
  DataRow,
} from "../types.js";
import { getConfig, fineBIFetch } from "../helpers.js";

/**
 * List all available FineBI datasets.
 */
export async function listDatasets(): Promise<ToolResult<Dataset[]>> {
  try {
    const config = await getConfig();
    const data = await fineBIFetch(config, "/api/dataset");
    const datasets = data as Dataset[];
    return { success: true, data: datasets };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Query a FineBI dataset by name with optional filters.
 *
 * @param dataset - Name of the dataset to query
 * @param filters - Optional key-value filters to apply
 */
export async function queryDataset(
  dataset: string,
  filters?: Record<string, string | number>
): Promise<ToolResult<QueryResult>> {
  try {
    const config = await getConfig();
    const body: Record<string, unknown> = { dataset };
    if (filters && Object.keys(filters).length > 0) {
      body["filters"] = filters;
    }

    const data = await fineBIFetch(config, "/api/dataset/query", {
      method: "POST",
      data: body,
    });

    const result = data as { rows: DataRow[]; total: number };
    return {
      success: true,
      data: { dataset, rows: result.rows, total: result.total },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create a new FineBI report from a dataset.
 *
 * @param params - Report creation parameters
 */
export async function createReport(params: CreateReportParams): Promise<ToolResult<Report>> {
  try {
    const config = await getConfig();
    const { title, dataset, chartType = "bar" } = params;

    const data = await fineBIFetch(config, "/api/report", {
      method: "POST",
      data: { title, dataset, chartType },
    });

    const report = data as Report;
    return { success: true, data: report };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Dashboard export tools for FineBI (doc-view-2061).
 */

import type {
  ExportDashboardExcelParams,
  ExportDashboardPdfParams,
  ExportDashboardImageParams,
  ExportResult,
  ToolResult,
} from "../types.js";
import { getConfig, fineBIAuthDownload } from "../helpers.js";

/**
 * Export a dashboard to Excel format.
 *
 * @param params - Export parameters (reportId required, widgetId optional)
 */
export async function exportDashboardExcel(
  params: ExportDashboardExcelParams
): Promise<ToolResult<ExportResult>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({ reportId: params.reportId });
    if (params.widgetId) {
      query.set("widgetId", params.widgetId);
    }
    const path = `/v5/api/dashboard/report/export/excel?${query.toString()}`;
    const result = await fineBIAuthDownload(config, path);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Export a dashboard to PDF format.
 *
 * @param params - Export parameters (reportId required)
 */
export async function exportDashboardPdf(
  params: ExportDashboardPdfParams
): Promise<ToolResult<ExportResult>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({ reportId: params.reportId });
    const path = `/v5/api/dashboard/report/export/pdf?${query.toString()}`;
    const result = await fineBIAuthDownload(config, path);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Export a dashboard as a PNG image.
 *
 * @param params - Export parameters (reportId required)
 */
export async function exportDashboardImage(
  params: ExportDashboardImageParams
): Promise<ToolResult<ExportResult>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({ reportId: params.reportId });
    const path = `/v5/api/dashboard/report/export/png?${query.toString()}`;
    const result = await fineBIAuthDownload(config, path);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

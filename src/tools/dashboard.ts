/**
 * Dashboard information and management tools for FineBI (doc-view-2064).
 */

import type {
  DashboardUserInfo,
  GetDashboardsBySubjectParams,
  DashboardSummary,
  DashboardDetail,
  ToolResult,
} from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";

/**
 * Get current user information and their created dashboards.
 */
export async function getDashboardUserInfo(): Promise<ToolResult<DashboardUserInfo>> {
  try {
    const config = await getConfig();
    const response = await fineBIAuthFetch(
      config,
      "/v5/api/dashboard/user/info"
    );
    const result = response as { data: DashboardUserInfo };
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get the list of dashboards under a specific subject.
 *
 * @param params - Parameters containing the subject ID
 */
export async function getDashboardsBySubject(
  params: GetDashboardsBySubjectParams
): Promise<ToolResult<DashboardSummary[]>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({ subjectId: params.subjectId });
    const response = await fineBIAuthFetch(
      config,
      `/v5/api/platform/dashboard/list?${query.toString()}`
    );
    const result = response as { data: DashboardSummary[] };
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get detailed information about a specific dashboard.
 *
 * @param reportId - The dashboard ID
 */
export async function getDashboardDetail(
  reportId: string
): Promise<ToolResult<DashboardDetail>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({ reportId });
    const response = await fineBIAuthFetch(
      config,
      `/v5/api/dashboard/get?${query.toString()}`
    );
    const result = response as { data: DashboardDetail };
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}


/**
 * Get widget data for a dashboard report.
 * GET /v5/api/dashboard/report/widget/data
 * 
 * @param reportId The report/dashboard ID
 * @param widgetId The real widget ID
 */
export async function getWidgetData(
  reportId: string,
  widgetId: string
): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const url = `/v5/api/dashboard/report/widget/data?reportId=${encodeURIComponent(reportId)}&widgetId=${encodeURIComponent(widgetId)}`;
    const data = await fineBIAuthFetch(config, url, {
      method: "GET",
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

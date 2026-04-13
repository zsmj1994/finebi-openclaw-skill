/**
 * Dashboard information and management tools for FineBI (doc-view-2064).
 */

import type {
  DashboardUserInfo,
  GetDashboardsBySubjectParams,
  DashboardSummary,
  ToolResult,
  DashboardStyleData,
} from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";
import { enterSubjectEdit } from "./subject.js";

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

/**
 * Get dashboard design configuration.
 * GET /v5/design/report/pool/{dashboardID}/param
 *
 * @param dashboardId The dashboard ID
 */
export async function getDashboardDesignConfigure(
  dashboardId: string
): Promise<ToolResult<DashboardStyleData>> {
  try {
    const config = await getConfig();
    const url = `/v5/design/report/pool/${encodeURIComponent(dashboardId)}/param`;
    const response = await fineBIAuthFetch(config, url, { method: "GET" }) as { data: DashboardStyleData };

    const data = response.data;
    if (data && typeof data.basePool === "string") {
      try {
        data.basePool = JSON.parse(data.basePool);
      } catch (e) {
        // Ignore JSON parse error and keep as string
      }
    }
    if (data && typeof data.designConfigure === "string") {
      try {
        data.designConfigure = JSON.parse(data.designConfigure);
      } catch (e) {
        // Ignore JSON parse error and keep as string
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get the template style configuration for a dashboard.
 *
 * @param dashboardId The dashboard ID
 */
export async function getDashboardStyle(
  dashboardId: string
): Promise<ToolResult<any>> {
  const result = await getDashboardDesignConfigure(dashboardId);
  if (!result.success || !result.data) {
    return result;
  }

  const templateStyle = result.data.designConfigure?.templateStyle;
  return { success: true, data: templateStyle };
}

/**
 * Set dashboard style configuration.
 *
 * @param dashboardId The dashboard ID
 * @param styleData The template style data object
 */
export async function setDashboardStyle(
  dashboardId: string,
  styleData: any
): Promise<ToolResult<any>> {
  try {
    const getConfigResult = await getDashboardDesignConfigure(dashboardId);
    if (!getConfigResult.success || !getConfigResult.data) {
      return getConfigResult;
    }

    const fullConfig = getConfigResult.data;

    // Initialize/Enter subject edit session to get current session ID
    const enterRes = await enterSubjectEdit(fullConfig.subjectId);
    if (!enterRes.success || !enterRes.data) {
      return { success: false, error: enterRes.error || "Failed to enter subject edit session" };
    }
    const sessionId = enterRes.data.subjectEditSessionId;

    // Update templateStyle inside designConfigure
    if (!fullConfig.designConfigure) {
      fullConfig.designConfigure = {};
    }
    fullConfig.designConfigure.templateStyle = styleData;

    const payload = { ...fullConfig.designConfigure };

    const config = await getConfig();
    const url = `/v5/cache/report/save?reportId=${encodeURIComponent(dashboardId)}`;
    const response = await fineBIAuthFetch(config, url, {
      method: "POST",
      data: payload,
      headers: {
        "subjecteditsessionid": sessionId,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

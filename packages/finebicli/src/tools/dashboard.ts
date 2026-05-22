/**
 * Dashboard information and management tools for FineBI (doc-view-2064).
 */

import type {
  DashboardUserInfo,
  GetDashboardsBySubjectParams,
  DashboardSummary,
  ToolResult,
} from "../types.js";
import { FineBIQueryDataSDK } from "finebi-querydata-sdk";
import { fineBIAuthFetch, getConfig } from "../helpers.js";

/**
 * Get current user information and their created dashboards.
 */
export async function getDashboardUserInfo(): Promise<ToolResult<DashboardUserInfo>> {
  try {
    const response = await fineBIAuthFetch(
      "/v5/api/dashboard/user/info"
    );
    const result = response as { data: DashboardUserInfo };
    console.log(response)
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
    const query = new URLSearchParams({ subjectId: params.subjectId });
    const response = await fineBIAuthFetch(
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
 * @param widgetId The reportWidgets wId
 */
export async function getWidgetData(
  reportId: string,
  wId: string,
  filter?: Record<string, unknown>,
  linkage?: { widgetId: string; payload: Record<string, unknown> }
): Promise<ToolResult<any>> {
  let sdk: FineBIQueryDataSDK | null = null;
  try {
    const config = await getConfig();

    const sdkInitOptions = {
      dashboardId: reportId,
      finebiServerUrl: config.baseUrl,
    } as any;

    sdk = await FineBIQueryDataSDK.create(sdkInitOptions);

    if (filter) {
      await sdk.filter.applyFilter(filter);
    }

    if (linkage) {
      await sdk.linkage.applyLinkage(linkage.widgetId, linkage.payload as any);
    }

    const data = await sdk.query.getWidgetData(wId);

    console.log("Widget Data:", data);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (sdk) {
      sdk.destroy();
    }
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
): Promise<ToolResult<{ reportId: string; reportName: any; reportWidgets: any; widgets: any }>> {
  try {
    const url = `/v5/design/report/pool/${encodeURIComponent(dashboardId)}/param`;
    const response = await fineBIAuthFetch(url, { method: "GET" }) as { data: any };

    const raw = response.data;

    let designConfigure: any = {};
    if (typeof raw?.designConfigure === "string") {
      try {
        designConfigure = JSON.parse(raw.designConfigure);
      } catch (e) {
        throw new Error(`解析 designConfigure 失败: ${e}`);
      }
    }

    const data = {
      reportId: designConfigure.reportId,
      reportName: designConfigure.reportName,
      reportWidgets: designConfigure.reportWidgets,
      widgets: designConfigure.widgets,
    };

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}



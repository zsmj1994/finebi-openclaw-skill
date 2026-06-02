/**
 * Dashboard information and management tools for FineBI (doc-view-2064).
 */

import type {
  DashboardUserInfo,
  GetDashboardsBySubjectParams,
  DashboardSummary,
  DashboardDesignData,
  RawDesignConfigure,
  ReportWidgetEntry,
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
    console.log(response);
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
): Promise<ToolResult<DashboardDesignData>> {
  try {
    const url = `/v5/design/report/pool/${encodeURIComponent(dashboardId)}/param`;
    const response = await fineBIAuthFetch(url, { method: "GET" }) as { data: any };

    const raw = response.data;

    let designConfigure: RawDesignConfigure = { reportId: "", reportName: "" };
    if (typeof raw?.designConfigure === "string") {
      try {
        designConfigure = JSON.parse(raw.designConfigure) as RawDesignConfigure;
      } catch (e) {
        throw new Error(`解析 designConfigure 失败: ${e}`);
      }
    }

    const reportWidgets: Record<string, ReportWidgetEntry> = {};

    Object.entries(designConfigure.reportWidgets || {}).forEach(([wId, widget]) => {
      const { title, realWidgetId, type } = widget;
      if (type === 1) {
        reportWidgets[wId] = {
          title: designConfigure.widgets?.[realWidgetId]?.name ?? title ?? wId,
          realWidgetId,
          type,
        };
      }
    });

    const data: DashboardDesignData = {
      reportId: designConfigure.reportId,
      reportName: designConfigure.reportName,
      reportWidgets,
    };

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

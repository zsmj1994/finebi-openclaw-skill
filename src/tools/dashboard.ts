import type {
  DashboardUserInfo,
  SearchDashboardsParams,
  SearchDashboardsResult,
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
      "/webroot/decision/v5/api/dashboard/user/info"
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
 * Search dashboards under the publish management node with pagination.
 *
 * @param params - Search parameters (page and count required)
 */
export async function searchDashboards(
  params: SearchDashboardsParams
): Promise<ToolResult<SearchDashboardsResult>> {
  try {
    const config = await getConfig();
    const query = new URLSearchParams({
      page: String(params.page),
      count: String(params.count),
    });
    const response = await fineBIAuthFetch(
      config,
      `/webroot/decision/v5/api/dashboard/search?${query.toString()}`
    );
    const result = response as { data: SearchDashboardsResult };
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
      `/webroot/decision/v5/api/platform/dashboard/list?${query.toString()}`
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
      `/webroot/decision/v5/api/dashboard/get?${query.toString()}`
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

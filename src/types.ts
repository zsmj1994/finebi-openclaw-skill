/**
 * Shared TypeScript types for the FineBI OpenClaw skill.
 */

/** Configuration for connecting to a FineBI instance */
export interface FineBIConfig {
  baseUrl: string;
  username: string;
  password: string;
}

/** Known error codes from FineBI API */
export enum FineBIErrorCode {
  TOKEN_EXPIRED = "21300001",
  LOGIN_INFO_NULL = "21300014",
  LOGIN_FAILED = "21300007",
}

/** A FineBI dataset descriptor */
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A row of data returned from a dataset query */
export type DataRow = Record<string, string | number | boolean | null>;

/** Result of a dataset query */
export interface QueryResult {
  dataset: string;
  rows: DataRow[];
  total: number;
}

/** Supported chart types for report creation */
export type ChartType = "bar" | "line" | "pie" | "table";

/** Parameters for creating a FineBI report */
export interface CreateReportParams {
  title: string;
  dataset: string;
  chartType?: ChartType;
}

/** A FineBI report */
export interface Report {
  id: string;
  title: string;
  dataset: string;
  chartType: ChartType;
  createdAt: string;
}

/** Result of a successful login */
export interface LoginResult {
  /** Authentication token returned by FineBI */
  accessToken: string;
}

/** Tool call result wrapper */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Dashboard export types (doc-view-2061)
// ---------------------------------------------------------------------------

/** Parameters for exporting a dashboard to Excel */
export interface ExportDashboardExcelParams {
  /** Dashboard ID (required) */
  reportId: string;
  /** Widget/component ID within the dashboard (optional, export specific widget) */
  widgetId?: string;
}

/** Parameters for exporting a dashboard to PDF */
export interface ExportDashboardPdfParams {
  /** Dashboard ID (required) */
  reportId: string;
}

/** Parameters for exporting a dashboard to PNG image */
export interface ExportDashboardImageParams {
  /** Dashboard ID (required) */
  reportId: string;
}

/** Result of a dashboard export operation */
export interface ExportResult {
  /** The exported file content as an ArrayBuffer */
  content: ArrayBuffer;
  /** The content type of the exported file */
  contentType: string;
  /** Suggested filename from the response, if available */
  filename?: string;
}

// ---------------------------------------------------------------------------
// Dashboard information types (doc-view-2064)
// ---------------------------------------------------------------------------

/** User information returned by the dashboard user info API */
export interface DashboardUserInfo {
  userInfo: Record<string, unknown>;
  dashboards: DashboardSummary[];
}

/** Summary information of a dashboard */
export interface DashboardSummary {
  reportId: string;
  name: string;
  initTime?: number;
  [key: string]: unknown;
}

/** Parameters for searching dashboards with pagination */
export interface SearchDashboardsParams {
  /** Page number (required) */
  page: number;
  /** Number of items per page (required) */
  count: number;
}

/** Result of a dashboard search operation */
export interface SearchDashboardsResult {
  reportIndexList: Array<{
    userInfo: Record<string, unknown>;
    reportIndex: DashboardSummary;
  }>;
  totalCount: number;
}

/** Parameters for listing dashboards under a subject */
export interface GetDashboardsBySubjectParams {
  /** Subject ID (required) */
  subjectId: string;
}

/** Dashboard detail information */
export interface DashboardDetail {
  reportId: string;
  name: string;
  [key: string]: unknown;
}

/** Parameters for creating a new dashboard */
export interface CreateDashboardParams {
  /** Dashboard name (required) */
  name: string;
  /** Additional parameters */
  [key: string]: unknown;
}

/** Parameters for renaming a dashboard */
export interface RenameDashboardParams {
  /** Dashboard ID (required) */
  reportId: string;
  /** New name for the dashboard (required) */
  name: string;
}

/** Parameters for deleting a dashboard */
export interface DeleteDashboardParams {
  /** Dashboard ID (required) */
  reportId: string;
}

/** Response structure for directory tree node under /view/entry/tree */
export interface EntryTreeNode {
  description: string | null;
  deviceType: number;
  docs: any[];
  entryType: number;
  fullParentName: string | null;
  id: string;
  isParent: boolean;
  pId: string;
  parentNames: string[];
  path: string;
  reportIndexes: any[];
  sortIndex: number;
  templateId: string;
  text: string;
  widgets: any[];
  [key: string]: any;
}

/** Item within a published subject resource list */
export interface PublishedResourceItem {
  id: string;
  name: string;
  itemType: number;
  tableType: number;
  [key: string]: any;
}

/** Response structure for published subject resources */
export interface PublishedSubjectResource {
  id: string;
  name: string;
  resourceList: PublishedResourceItem[];
  [key: string]: any;
}

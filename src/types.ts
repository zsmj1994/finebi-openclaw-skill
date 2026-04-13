/**
 * Shared TypeScript types for the FineBI OpenClaw skill.
 */

/** Configuration for connecting to a FineBI instance */
export interface FineBIConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  lightAuthToken?: string;
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

/** Parameters for listing dashboards under a subject */
export interface GetDashboardsBySubjectParams {
  /** Subject ID (required) */
  subjectId: string;
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

/** Response structure for entering a subject edit session */
export interface SubjectEditSession {
  subjectEditSessionId: string;
  editKeyId: string;
  firstEnterSubjectEditSession: boolean;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Dashboard style types
// ---------------------------------------------------------------------------

export type Obj = Record<string, any>;
export type TemplateChart = Record<string, any>;
export type StyleTabType = string | number;

/** Configuration structure for dashboard styles */
export interface TemplateDetailStyle {
  id: string;
  name: string;
  /** 主题 */
  theme: string;
  styleThemeColor: string;
  table: {
    themeColor: string;
    tableStyle: number;
    font: Obj;
  };
  chart: TemplateChart;
  controlTheme: string;
  controlWidget: Obj;
  /** 仪表板背景 */
  templateBackground: { type: string; color?: string; imageId?: string };
  /** 标题背景 */
  titleBackground: { type: string; color?: string; imageId?: string };
  /** 标题字体 */
  titleFont: Obj;
  /** 组件背景 */
  widgetBackground: {
    type: string;
    color?: string;
    imageId?: string;
    borderColor: string;
    borderRadius: number;
    borderSize: number;
  };
  /** 图片组件背景 */
  imageWidgetBackground: {
    type: string;
    color?: string;
    imageId?: string;
    borderColor: string;
    borderRadius: number;
    borderSize: number;
  };
  /** 组件间距 */
  widgetGap?: number;
  currentStyleTab: StyleTabType;
  initTime: number;
  /** 悬浮阴影 */
  hoverShadow: boolean;
}

export interface DashboardStyleData {
  basePool: TemplateDetailStyle | string;
  designConfigure: any | string;
  sessionId: string;
  subjectId: string;
  title: string;
  [key: string]: any;
}

/**
 * Main entry point for the FineBI OpenClaw skill.
 *
 * This module wires up all tool handlers and exports the skill manifest
 * consumed by the OpenClaw runtime.
 */
export { getConfig } from "./helpers.js";
export { runInstall } from "./install.js";

export {
  login,
  previewDatasetData,
  searchDatasets,
  getDatasetInfo,
  exportDashboardExcel,
  exportDashboardPdf,
  exportDashboardImage,
  getDashboardUserInfo,
  searchDashboards,
  getDashboardsBySubject,
  getDashboardDetail,
} from "./tools/index.js";
export { FineBIErrorCode } from "./types.js";
export type {
  FineBIConfig,
  Dataset,
  QueryResult,
  CreateReportParams,
  Report,
  ToolResult,
  LoginResult,
  ChartType,
  DataRow,
  ExportDashboardExcelParams,
  ExportDashboardPdfParams,
  ExportDashboardImageParams,
  ExportResult,
  DashboardUserInfo,
  DashboardSummary,
  SearchDashboardsParams,
  SearchDashboardsResult,
  GetDashboardsBySubjectParams,
  DashboardDetail,
  CreateDashboardParams,
  RenameDashboardParams,
  DeleteDashboardParams,
} from "./types.js";

export * from "./tools/package.js";
export * from "./tools/report.js";
export * from "./tools/data-center.js";
export * from "./tools/spider.js";
export * from "./tools/subject.js";

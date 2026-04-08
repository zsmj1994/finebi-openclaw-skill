#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  listDatasets,
  queryDataset,
  createReport,
  exportDashboardExcel,
  exportDashboardPdf,
  exportDashboardImage,
  getDashboardUserInfo,
  searchDashboards,
  getDashboardsBySubject,
  getDashboardDetail,
  createDashboard,
  renameDashboard,
  deleteDashboard,
  getWidgetData,
  getEntryTree,
  getPublishedSubjectResources,
} from "./tools/index.js";
import { runInit } from "./init.js";

const program = new Command();

program
  .name("finebi-cli")
  .description("CLI to interact with FineBI for data analysis and visualization")
  .version("0.1.0");

// Helper to log results
const handleResult = (result: any) => {
  if (result.success) {
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
};

// Helper to log export results and save to file
const handleExportResult = (result: any, defaultExt: string) => {
  if (result.success) {
    const data = result.data;
    const buffer = Buffer.from(data.content);
    const filename = data.filename || `export-${Date.now()}.${defaultExt}`;
    const filePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(filePath, buffer);
    console.log(JSON.stringify({ filePath, contentType: data.contentType, filename }, null, 2));
  } else {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
};

program
  .command("init")
  .description("Interactively configure FineBI connection")
  .action(async () => {
    await runInit();
  });

program
  .command("get-entry-tree")
  .description("Get the directory tree the user has permission to view")
  .action(async () => {
    const res = await getEntryTree();
    handleResult(res);
  });

program
  .command("get-published-subject-resources")
  .description("Query the resources exposed by a published analysis subject using a templateId/publishTaskId")
  .requiredOption("-t, --task-id <id>", "The templateId or publishTaskId")
  .action(async (options) => {
    const res = await getPublishedSubjectResources(options.taskId);
    handleResult(res);
  });

program
  .command("list-datasets")
  .description("List all available FineBI datasets")
  .action(async () => {
    const res = await listDatasets();
    handleResult(res);
  });

program
  .command("query-dataset")
  .description("Query a FineBI dataset")
  .requiredOption("-d, --dataset <name>", "Name of the dataset")
  .option("-f, --filters <json>", "JSON string of key-value filters to apply")
  .action(async (options) => {
    let filters;
    if (options.filters) {
      try {
        filters = JSON.parse(options.filters);
      } catch (e) {
        console.error("Invalid JSON format for filters");
        process.exit(1);
      }
    }
    const res = await queryDataset(options.dataset, filters);
    handleResult(res);
  });

program
  .command("get-widget-data")
  .description("Get data for a specific widget inside a dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard/Report ID")
  .requiredOption("-w, --widget-id <id>", "Widget ID")
  .action(async (options) => {
    const res = await getWidgetData(options.reportId, options.widgetId);
    handleResult(res);
  });

program
  .command("create-report")
  .description("Create a new FineBI report")
  .requiredOption("-t, --title <title>", "Report title")
  .requiredOption("-d, --dataset <name>", "Source dataset name")
  .option("-c, --chart-type <type>", "Type of chart (bar, line, pie, table)", "bar")
  .action(async (options) => {
    const res = await createReport({
      title: options.title,
      dataset: options.dataset,
      chartType: options.chartType as "bar" | "line" | "pie" | "table",
    });
    handleResult(res);
  });

program
  .command("export-dashboard-excel")
  .description("Export a dashboard to Excel format")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .option("-w, --widget-id <id>", "Widget/component ID to export a specific widget")
  .action(async (options) => {
    const res = await exportDashboardExcel({
      reportId: options.reportId,
      widgetId: options.widgetId,
    });
    handleExportResult(res, "xlsx");
  });

program
  .command("export-dashboard-pdf")
  .description("Export a dashboard to PDF format")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options) => {
    const res = await exportDashboardPdf({
      reportId: options.reportId,
    });
    handleExportResult(res, "pdf");
  });

program
  .command("export-dashboard-image")
  .description("Export a dashboard to image (PNG) format")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options) => {
    const res = await exportDashboardImage({
      reportId: options.reportId,
    });
    handleExportResult(res, "png");
  });

program
  .command("get-dashboard-user-info")
  .description("Get current user information and their created dashboards")
  .action(async () => {
    const res = await getDashboardUserInfo();
    handleResult(res);
  });

program
  .command("search-dashboards")
  .description("Search dashboards under the publish management node with pagination")
  .requiredOption("-p, --page <number>", "Page number")
  .requiredOption("-c, --count <number>", "Number of items per page")
  .action(async (options) => {
    const res = await searchDashboards({
      page: parseInt(options.page, 10),
      count: parseInt(options.count, 10),
    });
    handleResult(res);
  });

program
  .command("get-dashboards-by-subject")
  .description("Get the list of dashboards under a specific subject")
  .requiredOption("-s, --subject-id <id>", "Subject ID")
  .action(async (options) => {
    const res = await getDashboardsBySubject({
      subjectId: options.subjectId,
    });
    handleResult(res);
  });

program
  .command("get-dashboard-detail")
  .description("Get detailed information about a specific dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options) => {
    const res = await getDashboardDetail(options.reportId);
    handleResult(res);
  });

program
  .command("create-dashboard")
  .description("Create a new dashboard")
  .requiredOption("-n, --name <name>", "Dashboard name")
  .action(async (options) => {
    const res = await createDashboard({
      name: options.name,
    });
    handleResult(res);
  });

program
  .command("rename-dashboard")
  .description("Rename an existing dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .requiredOption("-n, --name <name>", "New dashboard name")
  .action(async (options) => {
    const res = await renameDashboard({
      reportId: options.reportId,
      name: options.name,
    });
    handleResult(res);
  });

program
  .command("delete-dashboard")
  .description("Delete a dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options) => {
    const res = await deleteDashboard({
      reportId: options.reportId,
    });
    handleResult(res);
  });

program.parse();

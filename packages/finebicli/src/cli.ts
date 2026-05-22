#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  queryDataset,
  previewDatasetData,
  getPublickDatasetsList,
  exportDashboardExcel,
  exportDashboardPdf,
  exportDashboardImage,
  getDashboardUserInfo,
  getDashboardsBySubject,
  getWidgetData,
  getEntryTree,
  getPublishedSubjectResources,
  subjectGroupsSearch,
  getDashboardDesignConfigure,
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
  .option("-k, --keyword <keyword>", "Filter nodes by text keyword")
  .action(async (options) => {
    const res = await getEntryTree(options.keyword);
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
  .command("search-my-datasets")
  .description("Search datasets in My Analysis")
  .option("-k, --keyword <keyword>", "Keyword to search", "")
  .option("-p, --page-index <number>", "Page index", "1")
  .option("-s, --search-type <number>", "Search type", "3")
  .option("-f, --filter-type <number>", "Filter type", "1")
  .action(async (options) => {
    const res = await subjectGroupsSearch({
      keyword: options.keyword,
      pageIndex: parseInt(options.pageIndex, 10),
      searchType: parseInt(options.searchType, 10),
      filterType: parseInt(options.filterType, 10),
    });
    handleResult(res);
  });

program
  .command("search-my-dashboards")
  .description("Search dashboards in My Analysis")
  .option("-k, --keyword <keyword>", "Keyword to search", "")
  .option("-p, --page-index <number>", "Page index", "1")
  .action(async (options) => {
    const res = await subjectGroupsSearch({
      keyword: options.keyword,
      pageIndex: parseInt(options.pageIndex, 10),
      searchType: 5,
    });
    handleResult(res);
  });

program
  .command("get-publick-datasets-list")
  .description("Get a list of public datasets")
  .option("-p, --page-index <number>", "Page index", "1")
  .option("-s, --page-size <number>", "Page size", "150")
  .action(async (options) => {
    const res = await getPublickDatasetsList({
      pageIndex: parseInt(options.pageIndex, 10),
      pageSize: parseInt(options.pageSize, 10),
    });
    handleResult(res);
  });

program
  .command("search-public-dataset")
  .description("Query a FineBI dataset by keyword")
  .option("-k, --keyword <keyword>", "Keyword to search")
  .option("-p, --page-index <number>", "Page index", "1")
  .option("-s, --page-size <number>", "Page size", "150")
  .action(async (options) => {
    const res = await queryDataset({
      keyword: options.keyword,
      pageIndex: parseInt(options.pageIndex, 10),
      pageSize: parseInt(options.pageSize, 10),
    });
    handleResult(res);
  });

program
  .command("preview-dataset-data")
  .description("Get fields and preview data for a specific dataset table")
  .requiredOption("-t, --table-name <id>", "Dataset table ID")
  .option("-k, --keyword <keyword>", "Keyword for filtering fields", "")
  .option("-l, --limit <number>", "Number of records to fetch", "5000")
  .option("-p, --page-index <number>", "Page index", "1")
  .action(async (options) => {
    const res = await previewDatasetData({
      tableName: options.tableName,
      keyword: options.keyword,
      limit: parseInt(options.limit, 10),
      pageIndex: parseInt(options.pageIndex, 10),
    });
    handleResult(res);
  });

program
  .command("get-widget-data")
  .description("Get data for a specific widget inside a dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard/Report ID")
  .requiredOption("-w, --widget-id <id>", "Widget ID")
  .option("--filter <json>", "Filter payload JSON to apply before querying widget data")
  .option("--linkage <json>", "Linkage payload JSON with widgetId and payload to apply before querying widget data")
  .action(async (options) => {
    let filter: Record<string, unknown> | undefined;
    let linkage: { widgetId: string; payload: Record<string, unknown> } | undefined;

    if (options.filter) {
      try {
        filter = JSON.parse(options.filter);
      } catch {
        console.error("Error: --filter must be valid JSON");
        process.exit(1);
      }
    }

    if (options.linkage) {
      try {
        linkage = JSON.parse(options.linkage);
      } catch {
        console.error("Error: --linkage must be valid JSON");
        process.exit(1);
      }

      if (!linkage || typeof linkage.widgetId !== "string" || !linkage.payload || typeof linkage.payload !== "object") {
        console.error("Error: --linkage must be JSON with widgetId and payload fields");
        process.exit(1);
      }
    }

    const res = await getWidgetData(options.reportId, options.widgetId, filter, linkage);
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
  .command("get-dashboard-design-configure")
  .description("获取仪表板详细配置信息")
  .requiredOption("-d, --dashboard-id <id>", "Dashboard ID")
  .action(async (options) => {
    const res = await getDashboardDesignConfigure(options.dashboardId);
    handleResult(res);
  });

program.parse();

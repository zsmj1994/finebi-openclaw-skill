#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  getDatasetInfo,
  previewDatasetData,
  searchDatasets,
  exportDashboardExcel,
  exportDashboardPdf,
  exportDashboardImage,
  getDashboardUserInfo,
  searchDashboards,
  getDashboardsBySubject,
  getDashboardDetail,
  reportList,
  reportInfo,
  reportConsanguinity,
  reportCheck,
  packageList,
  packageStructure,
  dataFolders,
  dataFolderTree,
  dataTablePreview,
  dataTableStructure,
  dataModel,
  dataQuery,
  dataPreview,
  dataSearchTables,
  dataSearchFields,
  dataFieldData,
  dataFieldRange,
  spiderStatus,
  subjectFolders,
  subjectTreeRoot,
  subjectContent,
  subjectReports,
  subjectGet,
  subjectSearch,
  subjectGroupsSearch,
  subjectConsanguinity,
  getConfig,
  runInstall,
} from "./index.js";

export const program = new Command();

program
  .name("finebi-cli")
  .description("CLI to interact with FineBI for data analysis and visualization")
  .version("0.1.0");

// Helper to check for config
const checkConfig = async () => {
  const config = await getConfig();
  const missing = [];
  if (!config.baseUrl) missing.push("FINEBI_BASE_URL");
  if (!config.username) missing.push("FINEBI_USERNAME");
  if (!config.password) missing.push("FINEBI_PASSWORD");

  if (missing.length > 0) {
    console.error(`Error: Missing required configuration: ${missing.join(", ")}`);
    console.error("Please run 'finebi-skill install' or 'npx finebi-openclaw-skill install' to configure your environment.");
    process.exit(1);
  }
};

program.hook("preAction", async (thisCommand, actionCommand) => {
  if (actionCommand.name() !== "install") {
    await checkConfig();
  }
});

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
  .command("install")
  .description("Interactively configure FineBI connection")
  .action(async () => {
    await runInstall();
  });

program
  .command("search-datasets")
  .description("Search datasets by keyword")
  .requiredOption("-k, --keyword <keyword>", "The keyword to search for")
  .option("-p, --page <number>", "Page number", "1")
  .action(async (options: any) => {
    const res = await searchDatasets(options.keyword, parseInt(options.page, 10));
    handleResult(res);
  });

program
  .command("preview-dataset-data")
  .description("Preview dataset data with a limit of up to 100,000 rows")
  .requiredOption("-d, --dataset <tableName>", "Original name of the dataset")
  .option("-p, --page <number>", "Page number", "1")
  .option("-s, --size <number>", "Page size (up to 100000)", "100")
  .action(async (options: any) => {
    const res = await previewDatasetData(options.dataset, options.page, options.size);
    handleResult(res);
  });

program
  .command("get-dataset-info")
  .description("Get a FineBI dataset info by tableName")
  .requiredOption("-d, --dataset <name>", "Name of the dataset")
  .action(async (options: any) => {
    const res = await getDatasetInfo(options.dataset);
    handleResult(res);
  });

program
  .command("export-dashboard-excel")
  .description("Export a dashboard to Excel format")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .option("-w, --widget-id <id>", "Widget/component ID to export a specific widget")
  .action(async (options: any) => {
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
  .action(async (options: any) => {
    const res = await exportDashboardPdf({
      reportId: options.reportId,
    });
    handleExportResult(res, "pdf");
  });

program
  .command("export-dashboard-image")
  .description("Export a dashboard to image (PNG) format")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options: any) => {
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
  .action(async (options: any) => {
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
  .action(async (options: any) => {
    const res = await getDashboardsBySubject({
      subjectId: options.subjectId,
    });
    handleResult(res);
  });

program
  .command("get-dashboard-detail")
  .description("Get detailed information about a specific dashboard")
  .requiredOption("-r, --report-id <id>", "Dashboard ID")
  .action(async (options: any) => {
    const res = await getDashboardDetail(options.reportId);
    handleResult(res);
  });

// ---- Auto Generated Migrated CLI Commands ----

program
  .command("report-list")
  .description("List reports for a given subject")
  .requiredOption("-s, --subject-id <id>", "Subject ID")
  .action(async (options: any) => {
    const res = await reportList(options.subjectId);
    handleResult(res);
  });

program
  .command("report-info")
  .description("Get detailed information for one or more reports")
  .requiredOption("-i, --report-ids <ids>", "Comma-separated report IDs")
  .action(async (options: any) => {
    const res = await reportInfo(options.reportIds);
    handleResult(res);
  });

program
  .command("report-consanguinity")
  .description("Get report lineage / consanguinity analysis")
  .requiredOption("-r, --report-id <id>", "Report ID")
  .action(async (options: any) => {
    const res = await reportConsanguinity(options.reportId);
    handleResult(res);
  });

program
  .command("report-check")
  .description("Check report state")
  .action(async (options: any) => {
    const res = await reportCheck();
    handleResult(res);
  });

program
  .command("package-list")
  .description("Get first-level folders in data configuration")
  .action(async (options: any) => {
    const res = await packageList();
    handleResult(res);
  });

program
  .command("package-structure")
  .description("Get folder hierarchy without tables")
  .requiredOption("-p, --pack-id <id>", "Package/Folder ID")
  .option("-t, --with-tables", "Include tables in the structure", false)
  .action(async (options: any) => {
    const res = await packageStructure(options.packId, !!options.withTables);
    handleResult(res);
  });

program
  .command("data-folders")
  .description("List first-level data center folders")
  .action(async (options: any) => {
    const res = await dataFolders();
    handleResult(res);
  });

program
  .command("data-folder-tree")
  .description("Get the full tree under a folder")
  .requiredOption("-f, --folder-id <id>", "Folder ID")
  .action(async (options: any) => {
    const res = await dataFolderTree(options.folderId);
    handleResult(res);
  });

program
  .command("data-table-preview")
  .description("Get preview data for a table")
  .requiredOption("-t, --table-name <name>", "Table Name")
  .action(async (options: any) => {
    const res = await dataTablePreview(options.tableName);
    handleResult(res);
  });

program
  .command("data-table-structure")
  .description("Get the schema/structure of a table")
  .requiredOption("-t, --table-name <name>", "Table Name")
  .action(async (options: any) => {
    const res = await dataTableStructure(options.tableName);
    handleResult(res);
  });

program
  .command("data-model")
  .description("Get a data model structure by ID")
  .requiredOption("-m, --model-id <id>", "Model ID")
  .action(async (options: any) => {
    const res = await dataModel(options.modelId);
    handleResult(res);
  });

program
  .command("data-query")
  .description("Execute a data model query")
  .requiredOption("-b, --body <json>", "Query body (JSON string)")
  .action(async (options: any) => {
    const res = await dataQuery(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("data-preview")
  .description("Preview data with pagination")
  .requiredOption("-b, --body <json>", "Preview config body (JSON string)")
  .action(async (options: any) => {
    const res = await dataPreview(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("data-search-tables")
  .description("Search data tables by keyword")
  .requiredOption("-b, --body <json>", "Search config body (JSON string)")
  .action(async (options: any) => {
    const res = await dataSearchTables(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("data-search-fields")
  .description("Search data fields by keyword")
  .requiredOption("-b, --body <json>", "Search config body (JSON string)")
  .action(async (options: any) => {
    const res = await dataSearchFields(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("data-field-data")
  .description("Get field enumeration data values")
  .requiredOption("-b, --body <json>", "Field config body (JSON string)")
  .action(async (options: any) => {
    const res = await dataFieldData(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("data-field-range")
  .description("Get the range (min/max) of a field")
  .requiredOption("-b, --body <json>", "Field config body (JSON string)")
  .action(async (options: any) => {
    const res = await dataFieldRange(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("spider-status")
  .description("Get the status of a spider update task instance")
  .requiredOption("-i, --task-instance-id <id>", "Task Instance ID")
  .action(async (options: any) => {
    const res = await spiderStatus(options.taskInstanceId);
    handleResult(res);
  });

program
  .command("subject-folders")
  .description("Get first-level folders in 'My Analysis'")
  .action(async (options: any) => {
    const res = await subjectFolders();
    handleResult(res);
  });

program
  .command("subject-tree-root")
  .description("Get the top-level subject tree")
  .action(async (options: any) => {
    const res = await subjectTreeRoot();
    handleResult(res);
  });

program
  .command("subject-content")
  .description("Get all items (datasets, components, dashboards) in a subject")
  .requiredOption("-s, --subject-id <id>", "Subject ID")
  .action(async (options: any) => {
    const res = await subjectContent(options.subjectId);
    handleResult(res);
  });

program
  .command("subject-reports")
  .description("Get all dashboards in a subject")
  .requiredOption("-s, --subject-id <id>", "Subject ID")
  .action(async (options: any) => {
    const res = await subjectReports(options.subjectId);
    handleResult(res);
  });

program
  .command("subject-get")
  .description("Batch-fetch subject info by IDs")
  .requiredOption("-i, --subject-ids <ids>", "Comma-separated subject IDs")
  .action(async (options: any) => {
    const res = await subjectGet(options.subjectIds.split(","));
    handleResult(res);
  });

program
  .command("subject-search")
  .description("Search subjects/folders within a subject")
  .requiredOption("-b, --body <json>", "Search config body (JSON string)")
  .action(async (options: any) => {
    const res = await subjectSearch(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("subject-groups-search")
  .description("Search across all subjects/folders")
  .requiredOption("-b, --body <json>", "Search config body (JSON string)")
  .action(async (options: any) => {
    const res = await subjectGroupsSearch(JSON.parse(options.body));
    handleResult(res);
  });

program
  .command("subject-consanguinity")
  .description("Get lineage/consanguinity within a subject")
  .requiredOption("-s, --subject-id <id>", "Subject ID")
  .action(async (options: any) => {
    const res = await subjectConsanguinity(options.subjectId);
    handleResult(res);
  });

program.parse();

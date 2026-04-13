---
name: "finebi-openclaw-skill"
description: "一个用于 OpenClaw 的 FineBI 技能，支持 npx 直接运行和插件体系，提供数据分析和可视化功能"
version: 0.1.2
author: zsmj1994
tags:
  - finebi
  - data-analysis
  - visualization
  - business-intelligence
  - reporting
triggers:
  - 使用 FineBI 进行数据看板分析
  - 查询获取 FineBI 数据资产
  - 导出并分析 FineBI 报表数据
metadata:
  clawdbot:
    emoji: "📊"
    requires:
      bins: ["node", "finebi-cli"]
      env: ["FINEBI_BASE_URL", "FINEBI_USERNAME", "FINEBI_PASSWORD", "FINEBI_LIGHT_AUTH_TOKEN]
    primaryEnv: "FINEBI_BASE_URL"
    install: "npm list -g finebi-openclaw-skill || npm install -g finebi-openclaw-skill"
runner: cli
entrypoint: finebi-cli
---

# FineBI 技能

## 技能介绍

该技能集成了 FineBI，能够通过自然语言实现数据分析、生成报告以及查询数据集等功能。

## 工具列表

### `init`
交互式配置 FineBI 连接（通常终端交互使用）。

**参数:** 无

### `subject-groups-search`
根据关键字搜索主题和文件夹。

**参数:**
- `keyword` (string, 选填):搜索关键字
- `pageIndex` (number, 选填): 分页索引，默认为 1
- `searchType` (number, 选填): 搜索类型，默认为 3
- `filterType` (number, 选填): 过滤类型，默认为 1

### `search-my-dashboards`
搜索“我的分析”中的仪表板。

**参数:**
- `keyword` (string, 选填): 搜索关键字
- `pageIndex` (number, 选填): 分页索引，默认为 1

### `get-publick-datasets-list`
获取公共数据集列表。

**参数:**
- `pageIndex` (number, 选填): 分页索引，默认为 1
- `pageSize` (number, 选填): 每页数据量，默认为 150

### `query-dataset`
通过关键字查询/搜索公共数据集。

**参数:**
- `keyword` (string, 选填): 搜索关键字
- `pageIndex` (number, 选填): 分页索引，默认为 1
- `pageSize` (number, 选填): 每页数据量，默认为 150

### `preview-dataset-data`
获取数据集表的字段列表和数据预览。

**参数:**
- `tableName` (string, 必填): 数据集表 ID
- `keyword` (string, 选填): 过滤字段的关键字
- `limit` (number, 选填): 提取记录数，默认为 5000
- `pageIndex` (number, 选填): 页码，默认为 1

### `export-dashboard-excel`
将仪表板导出为 Excel 格式。

**参数:**
- `reportId` (string, 必填): 仪表板 ID
- `widgetId` (string, 选填): 组件 ID，用于导出特定的组件

### `export-dashboard-pdf`
将仪表板导出为 PDF 格式。响应中会返回文件路径，和文件名。

**参数:**
- `reportId` (string, 必填): 仪表板 ID

### `export-dashboard-image`
将仪表板导出为 PNG 格式的图片。

**参数:**
- `reportId` (string, 必填): 仪表板 ID

### `get-dashboard-user-info`
获取当前用户信息及其创建的仪表板。

**参数:** 无


### `get-dashboards-by-subject`
获取特定主题下的仪表板列表。

**参数:**
- `subjectId` (string, 必填): 主题 ID


### `get-entry-tree`
获取用户有权限查看的目录树,返回的json中包含id，templateId等，其中templateId是发布挂出的任务id，即publishTaskId。

**参数:** 无

### `get-published-subject-resources`
根据目录节点的 templateId（即 publishTaskId）查询挂出的分析主题挂出的资源（如组件id和仪表板id）。

**参数:**
- `taskId` (string, 必填): 目录节点的 templateId 或发布任务的 publishTaskId

### `get-widget-data`
获取特定仪表板中具体组件的数据。

**参数:**
- `reportId` (string, 必填): 仪表板/报表 ID
- `widgetId` (string, 必填): 组件 ID

## 常见工作流 (Common Workflows)

### 使用/获取数据集数据
如果需要提取某个表的数据，标准的工作流程是：
1. **第一步**：先使用 `query-dataset` 命令，查到表信息，在返回结果中获取对应表的 ID（通常为 `name` 字段，即表的原始名称/ID）。
2. **第二步**：调用 `preview-dataset-data` 命令，传入查到的 ID，从而获取该数据集的具体数据记录。

### 导出 FineBI 仪表板为 PDF，然后分析导出的 PDF 文件生成报告 ⚠️

⚠️ **重要警告**：分析 PDF 时**必须且只能**使用 OpenClaw 内置的 `pdf` 工具！禁止使用任何其他方式读取 PDF 内容！

**工作流程**：
1. **导出 PDF**：调用 `export-dashboard-pdf` 命令，传入 `reportId` 参数，获取导出的 PDF 文件路径。
2. **复制到工作空间**：如果 PDF 在临时目录（如 `/tmp/` 或 `AppData/Local/Temp/`），必须先复制到工作空间目录（通常是 workspace）。
   - Windows: `Copy-Item <源路径> -Destination "C:\Users\dailer\.openclaw\workspace\"`
   - Linux/Mac: `cp <源路径> ~/workspace/`
3. **使用内置 pdf 工具分析** 📌：调用 `pdf` 工具读取 PDF 文件（传入本地文件路径），提取图表和数据内容。
4. **生成报告**：基于 PDF 内容生成 Markdown 格式的分析报告，包含核心主题、关键数据、趋势洞察和业务建议，最后发送给用户。


## 迁移的工具列表 (Migrated Tools)

### `data-table-preview`
Migrated tool: dataTablePreview

**参数:**
- `tableName`: 必填

### `data-table-structure`
Migrated tool: dataTableStructure

**参数:**
- `tableName`: 必填

### `data-model`
Migrated tool: dataModel

**参数:**
- `modelId`: 必填

### `data-query`
Migrated tool: dataQuery

**参数:**
- `body`: 必填

### `data-preview`
Migrated tool: dataPreview

**参数:**
- `body`: 必填

### `data-search-tables`
Migrated tool: dataSearchTables

**参数:**
- `body`: 必填

### `data-search-fields`
Migrated tool: dataSearchFields

**参数:**
- `body`: 必填

### `data-field-data`
Migrated tool: dataFieldData

**参数:**
- `body`: 必填

### `data-field-range`
Migrated tool: dataFieldRange

**参数:**
- `body`: 必填

### `spider-status`
Migrated tool: spiderStatus

**参数:**
- `taskInstanceId`: 必填

### `subject-folders`
Migrated tool: subjectFolders

**参数:**
- 无

### `subject-tree-root`
Migrated tool: subjectTreeRoot

**参数:**
- 无

### `subject-folder`
Migrated tool: subjectFolder

**参数:**
- `folderId`: 必填

### `subject-tree`
Migrated tool: subjectTree

**参数:**
- `folderId`: 必填

### `subject-crumb`
Migrated tool: subjectCrumb

**参数:**
- `folderId`: 必填

### `subject-content`
Migrated tool: subjectContent

**参数:**
- `subjectId`: 必填

### `subject-reports`
Migrated tool: subjectReports

**参数:**
- `subjectId`: 必填

### `subject-get`
Migrated tool: subjectGet

**参数:**
- `subjectIds`: 必填

### `subject-search`
Migrated tool: subjectSearch

**参数:**
- `body`: 必填

### `subject-groups-search`
Migrated tool: subjectGroupsSearch

**参数:**
- `body`: 必填

### `subject-consanguinity`
Migrated tool: subjectConsanguinity

**参数:**
- `subjectId`: 必填


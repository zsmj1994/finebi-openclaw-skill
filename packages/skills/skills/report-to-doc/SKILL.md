---
name: report-to-doc
description: "把 FineBI 看板导出件和真实数据整理成结构化分析文档。"
---

# Report To Doc

## 适用范围

这个子技能用于“把看板内容沉淀成文档”的场景。适合：

- 导出 PDF 后生成分析报告
- 把看板整理成经营分析文档
- 沉淀图表、结论和业务建议

## 必要流程

1. 先按 `references/dashboard-id-resolution-flow.md` 解析唯一的 `dashboardId`。不要把用户输入名称直接当成 id。
2. 再导出 PDF、图片，或读取关键组件数据。优先使用 `export-dashboard-pdf` 获取完整快照。
3. 最后根据导出结果和组件数据生成结构化文档。

如果需要组件级数据：

4. 先调用 `get-dashboard-design-configure`。
5. 检查 `designConfigure.reportWidgets`。
6. 把 `reportWidgets` 视为对象，`key` 就是组件 id。
7. 只对 `type = 1` 的组件使用 `get-widget-data`。
8. `type = 2` 表示过滤控件，不能当作取数组件。

## 必要 CLI 使用

- `get-entry-tree`
- `search-my-dashboards`
- `get-dashboard-design-configure`
- `get-widget-data`
- `export-dashboard-pdf`
- `export-dashboard-image`

## 规则

- 所有需要 `dashboardId` 的场景，先走共享的 dashboard id 解析流程。
- 先拿到 FineBI 真实输出，再写文档。
- 如果导出失败，要明确报错，不要伪造附件。
- 文档中的结论必须能够回溯到看板数据或导出内容。
- 如果用户指定文档类型，优先遵循该类型的结构。

## 建议输出

- 文档标题
- 执行摘要
- 关键指标与发现
- 趋势与风险
- 后续建议

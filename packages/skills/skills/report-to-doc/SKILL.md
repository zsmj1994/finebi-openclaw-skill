---
name: report-to-doc
description: "把 FineBI 看板导出件和真实数据整理成结构化分析文档。"
---

# Report To Doc

## 适用范围

这个子技能用于“把看板内容沉淀成文档”的场景。适合：

- 查询某个看板或仪表板的数据
- 洞察或者分析某个看板的数据
- 导出 PDF 后生成分析报告
- 把看板整理成经营分析文档
- 沉淀图表、结论和业务建议

## 必要流程

1. 先读取 `references/dashboard-question-answer-flow.md`，按看板问答取数链路执行。
2. 再读取 `references/dashboard-id-resolution-flow.md`，解析唯一的 `dashboardId`。不要把用户输入名称直接当成 id。
3. 如果是整体仪表板分析、经营分析文档或报告沉淀，优先调用 `export-dashboard-pdf` 获取完整快照。
4. 如果用户明确询问某个组件、图表、指标卡或需要精确数值，再读取 `references/dashboard-widget-data-flow.md` 并调用 `get-widget-data`。
5. 最后根据导出结果和组件数据生成结构化文档。

## 必要 CLI 使用

- `get-entry-tree`
- `search-my-dashboards`
- `export-dashboard-pdf`
- `export-dashboard-excel`

## 规则

- 所有需要 `dashboardId` 的场景，先走共享的 dashboard id 解析流程。
- 不要自写 JS、Python、浏览器自动化或抓包逻辑来查找看板、组件或数据。
- 整体仪表板分析优先使用 PDF；组件级精确问题再取 widget 数据。
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

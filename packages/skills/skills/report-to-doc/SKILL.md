---
name: report-to-doc
description: "把 FineBI 看板导出件和真实数据整理成结构化分析文档。"
---

# Report To Doc

## Scope

这个子技能用于“把看板内容沉淀成文档”的场景。适合：

- 导出 PDF 后生成分析报告
- 把看板整理成经营分析文档
- 沉淀图表、结论和业务建议

## Required workflow

1. 先定位唯一的 dashboard
2. 再导出 PDF、图片或读取关键组件数据
3. 再生成结构化文档

## Required CLI usage

- `search-my-dashboards`
- `get-widget-data`
- `export-dashboard-pdf`
- `export-dashboard-image`

## Rules

- 先拿到 FineBI 真实输出，再写文档
- 如果导出失败，明确报错，不要编造附件
- 文档中的结论必须能回溯到看板数据或导出内容
- 如果用户指定文档类型，优先遵循该类型的结构

## Recommended output

- 文档标题
- 执行摘要
- 关键指标与发现
- 趋势与风险
- 后续建议

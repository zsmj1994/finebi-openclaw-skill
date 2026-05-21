---
name: dashboard-briefing
description: "从 FineBI 看板提炼核心信息，生成日报、周报、群播报卡片和定时简报。"
---

# Dashboard Briefing

## 适用范围

这个子技能用于“消费看板”的场景，而不是回写数据的场景。适合：

- 生成日报、周报、月报摘要
- 把经营看板同步到群聊
- 先发一条测试卡片确认格式
- 配置基于看板的定时简报

## 必要流程

1. 先定位唯一的 `dashboard`。可以通过 `get-entry-tree` 找到已发布看板，也可以通过 `search-my-dashboards` 找到“我的分析”里的看板。
2. 再读取看板或组件的真实数据。优先使用 `get-widget-data` 获取关键组件数据，必要时使用 `export-dashboard-pdf` 获取完整快照。
3. 最后再做摘要、卡片或定时播报。

## 必要 CLI 使用

- `search-my-dashboards`
- `get-dashboard-user-info`
- `get-dashboard-design-configure`
- `get-dashboards-by-subject`
- `get-widget-data`
- `export-dashboard-pdf`

## 规则

- 不要把用户输入的名字直接当成 `dashboardId`。
- 如果看板不唯一，先澄清。
- 先拿到 FineBI 真实输出，再生成摘要。
- 不要伪造指标、趋势、刷新时间或播报结果。

## 建议输出

- 一段简要结论
- 关键指标列表
- 必要时附带截图或导出件
- 如果是定时播报，明确播报频率和目标群

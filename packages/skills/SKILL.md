---
name: "finebi-skills"
description: "FineBI 主技能入口。先识别用户目标，再路由到 dashboard-briefing、report-to-doc、alert-to-task、sync-to-bitable 等子技能。"
version: 0.2.16
author: zsmj1994
tags:
  - finebi
  - skill-router
  - business-intelligence
  - reporting
metadata:
  clawdbot:
    emoji: "📳"
    primaryEnv: "FINEBI_BASE_URL"
    install: "npm list -g finebi-cli || npm install -g finebi-cli"
    requires:
      bins: ["node", "finebi-cli"]
      env: ["FINEBI_BASE_URL", "FINEBI_LIGHT_AUTH_TOKEN"]
runner: cli
entrypoint: finebi-cli
---

# FineBI 主技能

这个文件是 `finebi-skills` 包的主技能入口。它负责先识别用户目标，再路由到合适的子技能，而不是把所有场景的细节流程都堆在一个文件里。

## 什么时候先用主技能

当用户要做下面这些事情时，先命中这个主技能：

- 查找并分析看板、组件和指标
- 生成日报、周报、月报或经营分析文档
- 监控阈值并转成任务或提醒
- 把 FineBI 数据同步到外部表格系统

## 子技能索引

| 子技能 | 目录 | 处理场景 |
| --- | --- | --- |
| `dashboard-briefing` | `skills/dashboard-briefing` | 看板摘要、群播报、定时简报 |
| `report-to-doc` | `skills/report-to-doc` | 看板导出、分析报告、文档沉淀 |
| `alert-to-task` | `skills/alert-to-task` | 阈值监控、异常检测、任务创建 |
| `sync-to-bitable` | `skills/sync-to-bitable` | 数据同步到飞书多维表格 |

## 路由规则

### 路由到 `dashboard-briefing`

当用户提到以下意图时优先路由：

- “给我生成日报/周报摘要”
- “把经营看板同步到群里”
- “做一个定时播报”
- “先发一条测试卡片看看”

### 路由到 `report-to-doc`

当用户提到以下意图时优先路由：

- “把这个看板整理成文档”
- “导出 PDF 后做分析报告”
- “给我一份经营分析稿”
- “把图表和结论沉淀成文档”

### 路由到 `alert-to-task`

当用户提到以下意图时优先路由：

- “低于阈值就告警”
- “异常时自动建任务”
- “监控库存、销量、回款”
- “命中条件后通知负责人”

### 路由到 `sync-to-bitable`

当用户提到以下意图时优先路由：

- “同步到飞书多维表格”
- “按主键增量更新”
- “覆盖整张表”
- “定时把数据灌到 bitable”

## 全局约束

- 先定位数据对象，再执行动作。数据对象可能是 `dashboard`、`dataset`、`subject`、`widget`。
- 只要后续流程需要 `dashboardId`，必须先按 `references/dashboard-id-resolution-flow.md` 判断来源并解析 id。
- 先拿到 FineBI 的真实输出，再做摘要、判断、告警、写文档或同步。
- 禁止伪造指标、趋势、负责人、任务状态、导出结果和同步结果。
- 如果目标对象不唯一，必须先澄清，不能跳步。
- 如果子技能匹配已经明确，直接按子技能流程继续，不要在主技能里重复展开细节。

## 公共参考

- CLI 命令与契约：`references/cli-command-map.md`
- 仪表板 id 解析：`references/dashboard-id-resolution-flow.md`
- 路由与拆分约定：`references/skill-routing.md`

## 无匹配时的降级策略

如果用户目标不能明确落到某一个子技能：

1. 先判断更像“看板消费”还是“数据集处理”。
2. 如果更像看板消费场景，优先走 `dashboard-briefing`。
3. 如果更像数据搬运或落库场景，优先走 `sync-to-bitable`。
4. 如果仍然不明确，只追问一个关键问题，不要一次追问多个问题。

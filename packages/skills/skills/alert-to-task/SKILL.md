---
name: alert-to-task
description: "基于 FineBI 数据集做阈值监控、异常检测，并把命中的结果转成任务或提醒。"
---

# Alert To Task

## Scope

这个子技能用于“先判断是否异常，再决定是否升级为任务”的场景。适合：

- 库存、销量、回款等阈值监控
- 指标异常时自动建任务
- 命中条件后通知负责人

## Required workflow

1. 先定位唯一的 dataset
2. 再读取真实数据
3. 再做阈值或异常判断
4. 只有命中条件时才升级成任务或通知

## Required CLI usage

- `search-my-datasets`
- `query-dataset`
- `preview-dataset-data`

## Rules

- 不要在没有真实数据时做阈值判断
- 不要伪造当前值、阈值、跌幅或负责人
- 如果条件没有命中，明确返回“不触发”
- 如果用户没有要求，不要自动假设通知渠道

## Recommended output

- 监控对象
- 当前值
- 判断规则
- 是否触发
- 若触发，给出建议动作或任务内容

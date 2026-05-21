---
name: sync-to-bitable
description: "把 FineBI 数据集结果同步到飞书多维表格，支持追加、覆盖和按主键增量更新。"
---

# Sync To Bitable

## Scope

这个子技能用于“把数据搬到外部表格系统”的场景。适合：

- 手动同步到飞书多维表格
- 定时把结果灌入 bitable
- 覆盖整表
- 追加新记录
- 按主键做增量更新

## Required workflow

1. 先定位唯一的 dataset
2. 再读取并预览真实数据
3. 再确认目标表结构和同步模式
4. 最后执行追加、覆盖或 upsert

## Required CLI usage

- `search-my-datasets`
- `query-dataset`
- `preview-dataset-data`

## Rules

- 覆盖模式必须二次确认
- 增量模式必须先确认主键
- 先做字段映射，再做正式同步
- 不要伪造同步条数、覆盖结果或目标表状态

## Recommended output

- 源数据集
- 目标表
- 同步模式
- 主键或映射规则
- 执行结果与风险提示

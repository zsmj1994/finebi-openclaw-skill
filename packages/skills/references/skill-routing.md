# Skill Routing Conventions

## 目标

把 `finebi-skills` 维护成“一主多从”的结构：

- 根 `SKILL.md` 是主技能入口
- `skills/*/SKILL.md` 是子技能
- `references/*` 放公共约定，避免在子技能里重复

## 子技能拆分原则

- 按用户最终目标拆，不按底层 CLI 命令拆
- 一个子技能只处理一个稳定场景
- 子技能之间尽量少重叠

## 当前子技能职责

- `dashboard-briefing`: 看板摘要、群播报、定时简报
- `report-to-doc`: 看板导出、分析报告、文档沉淀
- `alert-to-task`: 阈值监控、异常检测、任务创建
- `sync-to-bitable`: 数据同步到飞书多维表格

## 编写规范

- 主技能写路由，不写超长细节 SOP
- 子技能写具体流程、前置条件、禁止事项
- 公共命令名、术语、边界放到 `references/*`

## 命名规范

- 子技能目录名使用短横线英文短名
- 目录名应表达场景，例如 `report-to-doc`
- 避免 `skill-bi-*` 这类重复前缀

# CLI Command Map

这个文件记录 `finebi-skills` 写技能时优先引用的 CLI 能力边界，避免每个子技能重复发明命令名。

## Dashboard

- `search-my-dashboards`
- `get-dashboard-user-info`
- `get-dashboards-by-subject`
- `get-widget-data`
- `get-dashboard-style`
- `get-dashboard-design-configure`
- `set-dashboard-style`
- `export-dashboard-excel`
- `export-dashboard-pdf`
- `export-dashboard-image`

## Dataset

- `search-my-datasets`
- `get-publick-datasets-list`
- `query-dataset`
- `preview-dataset-data`

## Subject and Entry

- `get-entry-tree`
- `get-published-subject-resources`

## Usage rule

- 子技能里优先使用这里已经存在的 CLI 命令名。
- 如果某个工作流需要额外动作，而 CLI 里暂时没有，就在子技能里明确写成“需要补充的 CLI 能力”，不要自行编造为已存在命令。
- 主技能不直接承诺不存在的 CLI 命令。

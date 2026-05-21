# 仪表板 ID 解析流程

## 目标

在任何需要 `dashboardId` 的工作流里，先用正确来源解析出仪表板 id，再继续后续动作。

## 核心原则

- 不要把用户输入的名称直接当成 `dashboardId`。
- 先判断仪表板来源，再决定使用哪条命令链路。
- 如果来源不明确，先做最小化消歧，不要直接猜。

## 两条来源链路

### 来源一：挂出目录或已发布入口

当用户提到以下信号时，优先走这条链路：

- 挂出
- 发布
- 目录
- 门户
- 入口
- 节点
- 路径
- 某个栏目下的看板

推荐流程：

```text
get-entry-tree
-> 按 text/path 匹配目标节点
-> 读取 templateId
-> get-published-subject-resources(templateId)
-> 在 resourceList 中定位 dashboard 资源
-> 解析 dashboardId
```

注意：

- `get-entry-tree` 本身不等于已经拿到 `dashboardId`
- 它首先解决的是“挂出节点定位”
- 后续通常还要经过 `templateId -> published resources` 这条链路

### 来源二：我的分析中的仪表板

当用户提到以下信号时，优先走这条链路：

- 我的分析
- 我做的看板
- 我自己的 dashboard
- 我这边有个看板
- 直接按看板名找

推荐流程：

```text
search-my-dashboards
-> 按名称匹配候选 dashboard
-> 读取 reportId
```

## 默认策略

如果用户没有明确说来源：

1. 先根据措辞判断是否带有“挂出目录/发布入口”语义。
2. 如果明显带有目录或挂出语义，优先走 `get-entry-tree`。
3. 否则默认先走 `search-my-dashboards`。
4. 如果 `search-my-dashboards` 不能唯一命中，再询问用户这是“挂出目录里的看板”还是“我的分析里的看板”。

## 常见错误

### 错误 1：把用户输入名称直接当成 `dashboardId`

错误做法：

```text
用户说了看板名 -> 直接当成 dashboardId
```

正确做法：

```text
先判断来源 -> 再用对应命令解析 dashboardId
```

### 错误 2：看到“目录里的看板”却直接搜我的分析

如果用户强调的是目录、节点、挂出、发布，应优先走 `get-entry-tree`。

### 错误 3：把 `get-entry-tree` 结果直接当成 dashboard 列表

`get-entry-tree` 返回的是入口节点，不是 dashboard 列表。

## 推荐行为

1. 所有需要 `dashboardId` 的流程，先套用这份解析规则。
2. 先保留展示字段，再保留工作流字段。
3. 目录来源优先保留 `text`、`path`、`templateId`。
4. 我的分析来源优先保留 `name`、`reportId`。

## 简写版本

```text
需要 dashboardId
-> 先判断来源
-> 挂出目录: get-entry-tree -> templateId -> published resources -> dashboardId
-> 我的分析: search-my-dashboards -> reportId
-> 来源不明确: 默认先 search-my-dashboards, 必要时消歧
```

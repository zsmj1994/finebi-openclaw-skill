# 仪表板组件取数流程

## 目标

从一个仪表板中获取一个或多个可取数组件的数据。

这个流程用于用户想看组件级图表数据、表格数据或指标数据的场景。

## 适用场景

当用户提出以下需求时使用：

- 查看某个看板组件背后的数据
- 获取图表数据
- 获取表格组件的数据
- 查看某个指标卡的数据
- 做组件级分析

## 必要命令

- `get-dashboard-design-configure`
- `get-widget-data`

## 流程

### 第 1 步：先拿到 dashboard id

先确保已经知道 `dashboardId`。

它可能来自：

- `search-my-dashboards`
- `get-dashboards-by-subject`
- 已发布资源流程

### 第 2 步：读取仪表板配置

调用：

```bash
finebi-cli get-dashboard-design-configure -d <dashboardId>
```

预期结果：

- 仪表板配置对象
- `designConfigure.reportWidgets`

### 第 3 步：检查 `reportWidgets`

把 `reportWidgets` 视为：

- 一个对象
- 每个 `key` 是组件 id
- 每个 `value` 是该组件的配置对象

关键字段：

- `type = 1`：可取数的数据组件
- `type = 2`：过滤控件

### 第 4 步：选择目标组件

当用户要看真实组件数据时：

- 只能选择 `type = 1` 的组件

如果有多个组件都可能符合：

- 展示标题类字段或位置线索
- 必要时请用户确认

### 第 5 步：获取组件数据

调用：

```bash
finebi-cli get-widget-data -r <dashboardId> -w <widgetId>
```

这里：

- `reportId` 使用已知的 `dashboardId`
- `widgetId` 使用 `reportWidgets` 对象的 `key`

## 常见错误

### 错误 1：没读 dashboard 配置就直接取数

不要猜测组件 id。

正确流程：

```text
先拿到 dashboard id
-> get-dashboard-design-configure
-> 检查 reportWidgets
-> 选择 type=1 组件
-> get-widget-data
```

### 错误 2：把 `reportWidgets` 当成数组

`reportWidgets` 是对象映射。

组件 id 是对象的 `key`。

### 错误 3：对过滤控件取数

`type = 2` 的过滤控件不能作为 `get-widget-data` 的目标。

## 推荐行为

1. 先确认 `dashboardId`。
2. 读取 `designConfigure.reportWidgets`。
3. 根据 `type` 区分可取数组件和过滤控件。
4. 保留组件 id 供后续机器步骤使用。
5. 保留标题或展示线索供用户理解。

## 简写版本

```text
先拿到 dashboard id
-> get-dashboard-design-configure(dashboardId)
-> 检查 reportWidgets
-> 选择 key 且 type=1
-> get-widget-data(reportId=dashboardId, widgetId=该 key)
```

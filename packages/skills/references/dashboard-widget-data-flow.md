# 仪表板组件取数流程

## 目标

从一个仪表板中获取一个或多个可取数组件的真实数据。

这个流程用于用户想看图表数据、表格数据、指标卡数据，或者需要结合过滤/联动状态查看组件结果的场景。

## 适用场景

当用户提出以下需求时使用：

- 查看某个看板组件背后的真实数据
- 获取图表数据
- 获取表格组件数据
- 查看某个指标卡的数值
- 在指定过滤条件或联动上下文下取数组件

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

响应信息包括`reportId` `reportName` `reportWidgets`

重点关注：

- `reportWidgets`

### 第 3 步：检查 `reportWidgets`

`reportWidgets` 是放置在仪表板上的组件的映射：

- 每个 `key` 是组件id，当需要根据组件id查询数据的时候，使用的是此id
- 每个 `value` 是该组件的配置对象，其中`title`属性表示组件的名字

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

基础调用：

```bash
finebi-cli get-widget-data -r <dashboardId> -w <widgetId>
```

如果用户明确给出了过滤条件或联动上下文，也可以在同一次命令里附加：

```bash
finebi-cli get-widget-data -r <dashboardId> -w <widgetId> --filter '<json>'
finebi-cli get-widget-data -r <dashboardId> -w <widgetId> --linkage '<json>'
```

这里：

- `reportId` 使用已知的 `dashboardId`
- `widgetId` 使用 `reportWidgets` 对象的 `key`
- `--filter` 和 `--linkage` 会在同一次 SDK 生命周期里先执行，再取目标组件数据

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

### 错误 4：把过滤或联动拆成另一条独立生命周期的命令

如果你想模拟“先过滤/联动，再取数”，应优先把 `--filter` 或 `--linkage` 直接附加到同一次 `get-widget-data` 调用里。

## 推荐行为

1. 先确认 `dashboardId`
2. 读取 `designConfigure.reportWidgets`
3. 根据 `type` 区分可取数组件和过滤控件
4. 保留组件 id 与标题，便于后续解释
5. 如果用户给了过滤条件或联动上下文，优先附加到同一次 `get-widget-data` 调用

## 简写版本

```text
先拿到 dashboard id
-> get-dashboard-design-configure(dashboardId)
-> 检查 reportWidgets
-> 选择 key 中 type=1 的组件
-> 如有需要，附加 filter/linkage
-> get-widget-data(reportId=dashboardId, widgetId=该 key)
```

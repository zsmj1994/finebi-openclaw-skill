# get-widget-data

## 用途

获取某个仪表板组件的数据载荷。

只有在已经明确以下两件事之后，才应调用这个命令：

- `dashboardId`
- 从 `get-dashboard-design-configure` 中解析出的 `widgetId`

## CLI

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId>
```

可选：

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId> --response-params '<json>'
```

## 输入契约

- `reportId`：仪表板 id
- `widgetId`：来自 `reportWidgets` 的组件 id
- `responseParams`：可选，透传给 SDK 的响应参数

## 必要前置查询

调用该命令前，必须先调用：

```bash
finebi-cli get-dashboard-design-configure -d <dashboardId>
```

然后检查：

- `data.designConfigure.reportWidgets`

`reportWidgets` 应被视为：

- 一个对象
- 对象的每个 `key` 是组件 id
- 对象的每个 `value` 是组件配置对象

## 重要组件语义

在 `reportWidgets[widgetId]` 中：

- `type = 1`：可取数的数据组件
- `type = 2`：过滤控件，不能作为取数组件

## 返回契约

返回 `ToolResult<any>`，其中包含 FineBI 查询 SDK 返回的原始组件数据。

具体载荷会随组件类型和 FineBI 版本变化。

## 重要字段

### 上游展示字段

从仪表板配置中，可以使用以下信息帮助解释组件：

- 组件标题类字段
- 必要时用于消歧的布局或位置信息

### 上游工作流字段

- 仪表板 `reportId`
- `designConfigure.reportWidgets`
- 作为对象 `key` 的 `widgetId`
- `reportWidgets[widgetId].type`

### 下游结果值

- 返回的组件数据载荷

## 语义说明

- 不要猜测组件 id。
- 不要假设一个看板里的所有组件都能取数。
- `widgetId` 来自 `reportWidgets` 的对象 `key`，不应只依赖组件配置对象内部字段。
- `type = 2` 表示过滤控件，不能作为 `get-widget-data` 的目标。

## 常见后续链路

1. 确认 `dashboardId`
2. 调用 `get-dashboard-design-configure`
3. 检查 `designConfigure.reportWidgets`
4. 选择 `type = 1` 的组件
5. 使用该对象 `key` 作为 `widgetId`
6. 调用 `get-widget-data -r <reportId> -w <widgetId>`

## 应该做

- 在 `get-widget-data` 前先调用 `get-dashboard-design-configure`
- 在推理过程中同时保留组件标题和组件 id
- 当目标是取数时，先过滤掉 `type = 2` 控件

## 不要做

- 不要用过滤控件 id 调用 `get-widget-data`
- 不要把 `reportWidgets` 当成数组
- 如果还不知道组件 id，就不要跳过 dashboard 配置查询

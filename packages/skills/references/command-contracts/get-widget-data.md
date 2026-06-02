# get-widget-data

## 用途

获取某个仪表板组件的真实数据载荷。

只有在已经明确以下两件事之后，才应该调用这个命令：

- `dashboardId`
- 从 `get-dashboard-design-configure` 中解析出组件的 `widgetId`,

## CLI

基础调用：

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId>
```

可选地，在同一次 SDK 生命周期里先应用过滤或联动：

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId> --filter '<json>'
finebi-cli get-widget-data -r <reportId> -w <widgetId> --linkage '<json>'
```

## 输入契约

- `reportId`：仪表板 id
- `widgetId`：来自 `reportWidgets` 的组件 id
- `filter`：可选，在取数前先应用一次过滤条件
- `linkage`：可选，在取数前先应用一次联动状态，必须包含 `widgetId` 和 `payload`

### `filter` 结构

`--filter` 的 JSON 直接透传给 SDK 的 `filter.applyFilter(...)`。

示例：

```json
{
  "widgetId": "filterWidget",
  "value": {
    "type": 1,
    "value": ["华东"]
  }
}
```

### `linkage` 结构

`--linkage` 的 JSON 结构如下：

```json
{
  "widgetId": "sourceWidget",
  "payload": {
    "dId": "area",
    "fieldId": "field1",
    "text": "华东",
    "value": [
      {
        "dId": "area",
        "fieldId": "field1",
        "text": "华东"
      }
    ]
  }
}
```

## 必要前置查询

调用该命令前，必须先调用：

```bash
finebi-cli get-dashboard-design-configure -d <dashboardId>
```

然后检查：

- `data.designConfigure.reportWidgets`

`reportWidgets` 应视为对象映射：

- 对象的每个 `key` 是组件 id
- 对象的每个 `value` 是组件配置对象

## 重要组件语义

在 `reportWidgets[widgetId]` 中：

- `type = 1`：可取数的数据组件
- `type = 2`：过滤控件，不能作为 `get-widget-data` 的目标

## 返回契约

返回 `ToolResult<any>`，其中 `data` 为 FineBI 查询 SDK 返回的原始组件数据。

具体载荷会随组件类型和 FineBI 版本变化。

## 语义说明

- 不要猜测组件 id
- 不要假设一个看板里的所有组件都能取数
- `widgetId` 来自 `reportWidgets` 的对象 `key`
- 如果要模拟用户先过滤、再联动、再取数，可以把 `--filter` 和 `--linkage` 放到同一次命令里

## 常见后续链路

1. 确认 `dashboardId`
2. 调用 `get-dashboard-design-configure`
3. 检查 `designConfigure.reportWidgets`
4. 选择 `type = 1` 的组件
5. 使用该对象 `key` 作为 `widgetId`
6. 调用 `get-widget-data -r <reportId> -w <widgetId>`

如果用户已经明确给出了过滤条件或联动上下文，可在同一次命令里附加：

- `--filter '<json>'`
- `--linkage '<json>'`

## 应该做

- 在 `get-widget-data` 前先调用 `get-dashboard-design-configure`
- 在推理过程中同时保留组件标题和组件 id
- 当目标是取数时，先过滤掉 `type = 2` 控件

## 不要做

- 不要用过滤控件 id 调用 `get-widget-data`
- 不要把 `reportWidgets` 当成数组
- 如果还不知道组件 id，就不要跳过 dashboard 配置查询

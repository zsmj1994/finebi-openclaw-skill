# `controlType` 组件 value 结构整理

本文根据以下代码整理：

- `packages/webui-bi/src/modules/design/edit/widgets/template/template.model.tsx` 中的 `controlType`
- 各控件实现文件中的 `getValue()` / `setValue()`
- 公共类型定义 `packages/webui-core/src/types/dashboard/widget/control.widget.ts`

> 说明：本文描述的是**控件对外的 value 结构**，以各控件 `getValue()` 返回值为准；如果底层 FUI 组件内部结构和外部暴露结构不完全一致，以这里整理的“对外结构”为准。

---

## 1. 通用基础类型

### 1.1 通用字符串类 value

```ts
interface ControlWidgetStringValue {
    type: number;
    value: string[];
    assist: string[];
}
```

常见语义：

- `type === Selection.Multi`：多选/半选
- `type === Selection.All`：全选
- `value`：实际提交给后端的值集合
- `assist`：辅助展示值；在部分“全选但超限”的组件里，也可能承担“补充选中值”的语义

### 1.2 通用日期点 value

```ts
interface ControlWidgetDateValue {
    type: number;
    value: {
        year?: number | string;
        month?: number | string;
        quarter?: number | string;
        day?: number | string;
        hour?: number | string;
        minute?: number | string;
        second?: number | string;
        position?: number;
        [key: string]: any;
    };
}
```

常见语义：

- `type`：静态日期 / 动态日期（`BICst.DATE_TYPE.STATIC = 1`，`BICst.DATE_TYPE.DYNAMIC = 2`）
- `value.year/month/day/...`：具体时间点
- `position`：动态日期面板里用到的附加定位信息

### 1.3 通用日期区间 value

```ts
type ControlWidgetDateIntervalValue = {
    start: ControlWidgetDateValue | null;
    end: ControlWidgetDateValue | null;
};
```

---

## 2. 按 `BICst.DESIGN.WIDGET` 常量顺序整理的过滤组件表

下面这张表是从你给出的 `BICst.DESIGN.WIDGET` 常量里，**只筛出过滤类型组件**，再按常量出现顺序整理的。

> 筛选标准：既属于过滤组件，又实际出现在 `template.model.tsx` 的 `controlType` 分支中。

| 常量名 | 常量值 | 是否过滤组件 | `controlType` 映射控件 | 条件 / 分支说明 | 对外 value 结构 |
| --- | ---: | --- | --- | --- | --- |
| `STRING` | `32` | 是 | `ControlStringText` / `ControlStringSingle` / `ControlStringMulti` / `ControlStringMultiNoBar` | `useCustom`、`customValue`、`singleSelect`、`dimensions`、`useParameter`、`useWidgetParameter` 共同决定 | `ControlWidgetStringValue \| null` |
| `NUMBER` | `33` | 是 | `ControlNumber` | 固定映射 | `{ min, max, closeMin, closeMax }` |
| `TREE` | `34` | 是 | `ControlTree` | 固定映射 | 树形对象 |
| `INTERVAL_SLIDER` | `36` | 是 | `ControlIntervalSlider` | 固定映射 | `{ min, max, closeMin: true, closeMax: true }` |
| `TREE_LABEL` | `38` | 是 | `ControlTreeLabel` | 固定映射 | `string[][]` |
| `NUMBER_DROP_DOWN` | `39` | 是 | `ControlStringText` / `ControlStringSingle` / `ControlStringMulti` / `ControlStringMultiNoBar` | 在 `controlType` 中和 `STRING` 走同一分支 | `ControlWidgetStringValue \| null` |
| `DATE_INTERVAL` | `48` | 是 | `ControlDateInterval` / `ControlDateIntervalTime` | `showTime === SHOW` 时走时间区间，否则走日期区间 | `{ start, end } \| null`（时间版通常也是同结构） |
| `YEAR` | `49` | 是 | `ControlYear` | 固定映射 | `{ type, value: { year } }` |
| `QUARTER` | `50` | 是 | `ControlQuarter` | 固定映射 | `{ type, value: { year, quarter } }` |
| `MONTH` | `51` | 是 | `ControlMonth` | 固定映射 | `{ type, value: { year, month } }` |
| `DATE` | `52` | 是 | `ControlDate` / `ControlDateTime` | `showTime === SHOW` 时带时分秒，否则为日期点 | `{ type, value: { year, month, day, hour?, minute?, second? } }` |
| `STRING_LIST` | `59` | 是 | `ControlStringText` / `ControlStringListSingle` / `ControlStringListMulti` / `ControlStringListMultiNoBar` | `useCustom`、`customValue`、`singleSelect`、`dimensions`、`useParameter`、`useWidgetParameter` 共同决定 | `ControlWidgetStringValue \| null` |
| `TREE_LIST` | `60` | 是 | `ControlTreeList` | 固定映射 | 树形对象（见下文备注） |
| `DATE_PANE` | `61` | 是 | `ControlDatePane` / `ControlDatePaneTime` | `showTime === SHOW` 时走带时间的日期面板 | `{ type, value: {...} } \| null` |
| `YEAR_MONTH_INTERVAL` | `62` | 是 | `ControlYearMonthInterval` | 固定映射 | `{ start, end }`，端点内部是 `{ type, value: { year, month } }` |
| `TIME_GROUP` | `68` | 是 | `ControlDateGroup` | 固定映射 | `{ start, end }`（来自选中时间标签的 `dateIntervalValue`） |
| `STRING_GROUP` | `69` | 是 | `ControlStringText` / `ControlStringGroup` / `ControlMultiStringGroup` | `useCustom`、`customValue`、`singleSelect` 决定 | `ControlWidgetStringValue \| null` |
| `CUSTOM_STRING_FILTER_WIDGET` | `100` | 是 | `widget.widgetType` | 自定义过滤组件，直接返回自定义 xtype | 由自定义控件自己定义 |
| `CUSTOM_NUMBER_FILTER_WIDGET` | `101` | 是 | `widget.widgetType` | 自定义过滤组件，直接返回自定义 xtype | 由自定义控件自己定义 |
| `CUSTOM_DATE_FILTER_WIDGET` | `102` | 是 | `widget.widgetType` | 自定义过滤组件，直接返回自定义 xtype | 由自定义控件自己定义 |

### 2.1 本次未纳入表格的常量

下面这些虽然也出现在你贴出的 `BICst.DESIGN.WIDGET` 中，但**不属于这里讨论的过滤组件映射**，所以没有放进上表：

- 非过滤展示类：`TABLE`、`CROSS_TABLE`、`COMPLEX_TABLE`、`DETAIL`、`CHART`、`CHART_TABLE`、`CONTENT`、`IMAGE`、`WEB`、`TAB`、`COMBINE`、`EXCEL_REPORT`、`DOC_FIELD`、`FREEZE`、`AI_DIAGNOSIS`、`AI`
- 操作按钮类：`QUERY`、`RESET`、`CLEAR`
- 本文未在 `controlType` 分支中命中的类型：`SINGLE_SLIDER`、`STRING_LABEL`
- 非组件类型常量：`REQ_GET_DATA_LENGTH`

### 2.2 速读版结论

- **字符串系过滤控件**：`STRING`、`NUMBER_DROP_DOWN`、`STRING_LIST`、`STRING_GROUP`
- **数值系过滤控件**：`NUMBER`、`INTERVAL_SLIDER`
- **树系过滤控件**：`TREE`、`TREE_LABEL`、`TREE_LIST`
- **日期系过滤控件**：`DATE_INTERVAL`、`YEAR`、`QUARTER`、`MONTH`、`DATE`、`DATE_PANE`、`YEAR_MONTH_INTERVAL`、`TIME_GROUP`
- **自定义过滤控件**：`CUSTOM_STRING_FILTER_WIDGET`、`CUSTOM_NUMBER_FILTER_WIDGET`、`CUSTOM_DATE_FILTER_WIDGET`

---

## 3. 各类控件 value 结构详解

## 3.1 年 / 月 / 季 / 日期单点类

### `ControlYear`

```ts
{
    type: number,
    value: {
        year: number | string,
    },
}
```

示例：

```ts
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026 } }
```

### `ControlMonth`

```ts
{
    type: number,
    value: {
        year: number | string,
        month: number | string,
    },
}
```

示例：

```ts
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026, month: 5 } }
```

### `ControlQuarter`

```ts
{
    type: number,
    value: {
        year: number | string,
        quarter: number | string,
    },
}
```

示例：

```ts
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026, quarter: 2 } }
```

### `ControlDate` / `ControlDateTime`

```ts
{
    type: number,
    value: {
        year?: number | string,
        month?: number | string,
        day?: number | string,
        hour?: number | string,
        minute?: number | string,
        second?: number | string,
    },
}
```

示例：

```ts
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026, month: 5, day: 25 } }
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026, month: 5, day: 25, hour: 13, minute: 30, second: 0 } }
```

### `ControlDatePane` / `ControlDatePaneTime`

对外同样是单点日期结构，但有两个额外注意点：

1. **没选具体日期时返回 `null`**。
2. **动态日期面板**会用到 `position` 等附加字段。

静态示例：

```ts
{ type: BICst.DATE_TYPE.STATIC, value: { year: 2026, month: 5, day: 25 } }
```

动态示例：

```ts
{ type: BICst.DATE_TYPE.DYNAMIC, value: { year: 0, position: 1 } }
```

`ControlDatePaneTime` 还会把底层返回的 `val.value[0] || val.value` 归一成单对象，因此对外仍按“单点对象”理解即可。

---

## 3.2 日期区间类

### `ControlDateInterval`

```ts
{
    start: ControlWidgetDateValue | null,
    end: ControlWidgetDateValue | null,
} | null
```

说明：

- 当 `start` 和 `end` 都为空时，`getValue()` 会直接返回 `null`
- 每个端点内部仍然是 `ControlWidgetDateValue`

示例：

```ts
{
    start: { type: BICst.INTERVAL_DATE_TYPE.STATIC, value: { year: 2026, month: 5, day: 1 } },
    end: { type: BICst.INTERVAL_DATE_TYPE.STATIC, value: { year: 2026, month: 5, day: 31 } },
}
```

### `ControlDateIntervalTime`

```ts
{
    start: ControlWidgetDateValue | null,
    end: ControlWidgetDateValue | null,
}
```

示例：

```ts
{
    start: {
        type: BICst.INTERVAL_DATE_TYPE.STATIC,
        value: { year: 2026, month: 5, day: 1, hour: 0, minute: 0, second: 0 },
    },
    end: {
        type: BICst.INTERVAL_DATE_TYPE.STATIC,
        value: { year: 2026, month: 5, day: 31, hour: 23, minute: 59, second: 59 },
    },
}
```

### `ControlYearMonthInterval`

```ts
{
    start: {
        type: number,
        value: { year?: number | string; month?: number | string },
    } | null,
    end: {
        type: number,
        value: { year?: number | string; month?: number | string },
    } | null,
}
```

空值常量在代码里对应：

```ts
{ start: null, end: null }
```

### `ControlDateGroup`

`TIME_GROUP` 映射到 `ControlDateGroup`，它的 `getValue()` 返回的不是 tag id，而是**被选中时间标签的 `dateIntervalValue`**：

```ts
{
    start: ControlWidgetDateValue | null,
    end: ControlWidgetDateValue | null,
}
```

未选中时兜底为：

```ts
{ start: null, end: null }
```

补充：`EVENT_CHANGE` 事件还会额外带出第二个参数 `currentTimeTagId`，但这不是控件的主 value。

---

## 3.3 数值类

### `ControlNumber`

`ControlNumber` 直接透传 `NumberInterval.getValue()`，从默认值和其它调用方式看，对外可按下面结构理解：

```ts
{
    min: string | number,
    max: string | number,
    closeMin: boolean,
    closeMax: boolean,
}
```

示例：

```ts
{ min: 10, max: 100, closeMin: true, closeMax: false }
```

### `ControlIntervalSlider`

`getValue()` 是显式组装出来的，结构最明确：

```ts
{
    closeMax: true,
    closeMin: true,
    max: string | number,
    min: string | number,
}
```

示例：

```ts
{ min: 0, max: 100, closeMin: true, closeMax: true }
```

---

## 3.4 文本 / 数值下拉类

这一类包括：

- `ControlStringText`
- `ControlStringSingle`
- `ControlStringMulti`
- `ControlStringMultiNoBar`
- `ControlStringListSingle`
- `ControlStringListMulti`
- `ControlStringListMultiNoBar`
- `ControlStringGroup`
- `ControlMultiStringGroup`
- 以及 `NUMBER_DROP_DOWN` 走到的同一批控件

### 统一基础结构

```ts
{
    type: Selection.Multi | Selection.All,
    value: string[],
    assist: string[],
} | null
```

### 1）`ControlStringText`

虽然是文本输入框，但 `getValue()` 会**强制包装成多选结构**：

```ts
{
    type: Selection.Multi,
    value: [text],
    assist: [text],
} | null
```

空字符串时返回 `null`。

### 2）`ControlStringSingle` / `ControlStringListSingle`

虽然界面是单选，但对外依然包装成：

```ts
{
    type: Selection.Multi,
    value: [selected],
    assist: [selected] | string[],
}
```

也就是说：**单选控件对外仍然是数组结构**。

### 3）`ControlStringMulti` / `ControlStringListMulti`

```ts
{
    type: Selection.Multi | Selection.All,
    value: string[],
    assist: string[],
} | null
```

说明：

- 多选且 `value` 为空数组时，返回 `null`
- `assist` 通常只保留一部分用于展示（例如前 20 / 1000 项）

### 4）`ControlStringMultiNoBar` / `ControlStringListMultiNoBar`

结构仍然是：

```ts
{
    type: Selection.Multi | Selection.All,
    value: string[],
    assist: string[],
} | null
```

但有一个重要特例：

- 当底层是 `Selection.All`
- 且数据量超限（代码里按 `1000` 控制）

组件会把“全选”降级成半选结构返回：

```ts
{
    type: Selection.Multi,
    value: val.assist,
    assist: val.value,
}
```

所以这两个 `NoBar` 控件的 `assist` 不能简单理解成“纯展示字段”，它有时还参与“超限全选”的语义表达。

### 5）`ControlStringGroup` / `ControlMultiStringGroup`

按钮组最终统一返回：

```ts
{
    type: Selection.Multi,
    value: string[],
    assist: [],
} | null
```

说明：

- `ControlStringGroup` 和 `ControlMultiStringGroup` 的 value 结构完全一致
- 空选时返回 `null`
- 这两个控件**不会返回 `Selection.All`**

---

## 3.5 树类

### `ControlTree`

从 `getValue()` / `format.ts` 的消费方式看，`TREE` 最终值是**树形对象**：

```ts
{
    [nodeName: string]: TreeValue;
}

type TreeValue = {
    [childNodeName: string]: TreeValue;
};
```

示例：

```ts
{
    华东: {
        上海: {},
        江苏: {},
    },
    华北: {
        北京: {},
    },
}
```

空值通常是：

```ts
{}
```

### `ControlTreeList`

`TREE_LIST` 的 `getValue()` 由底层 `MultiSelectTree` 直接返回；结合：

- `format.ts` 中对 `TREE_LIST` 与 `TREE` 使用同一套格式化逻辑
- `isFilterValueNull()` 中“列表树”的空值被当作 `{}`

可以按下面结构理解：

```ts
{
    [nodeName: string]: TreeValue;
}
```

> 备注：`control.treelist.ts` 里 `setValue(v?: string[])` 的类型标注偏弱，但从消费侧看，最终 value 仍应按树形对象理解，而不是简单 `string[]`。

### `ControlTreeLabel`

`TREE_LABEL` 的值是**按层级拆开的二维数组**：

```ts
string[][]
```

示例：

```ts
[
    ['华东', '华北'],
    ['上海', '北京'],
]
```

不限/全选时，单层常见值形如：

```ts
[BICst.LIST_LABEL_TYPE.ALL]
```

所以整体常见空/不限表现是：

```ts
[
    [BICst.LIST_LABEL_TYPE.ALL],
    [BICst.LIST_LABEL_TYPE.ALL],
]
```

---

## 4. 特殊说明

### 4.1 `CUSTOM_STRING_FILTER_WIDGET` / `CUSTOM_NUMBER_FILTER_WIDGET` / `CUSTOM_DATE_FILTER_WIDGET`

这三类在 `controlType` 里不会映射到固定控件，而是直接返回：

```ts
this.model.widget.widgetType
```

因此它们的 value 结构**不受本文约束**，要看具体自定义控件自己的 `getValue()` / `setValue()` 实现。

### 4.2 `NUMBER_DROP_DOWN`

`NUMBER_DROP_DOWN` 在 `controlType` 中和 `STRING` 走同一套分支，所以它的 value 结构不是数值区间，而是**字符串数组型结构**：

```ts
{
    type: Selection.Multi | Selection.All,
    value: string[],
    assist: string[],
} | null
```

如果业务上把它当“数字枚举下拉”，那只是数据内容是数字字符串，结构上仍按字符串控件处理。

---

## 5. 最终可直接复用的速查版本

```ts
// 字符串/枚举型
 type StringLikeValue = {
    type: number;
    value: string[];
    assist: string[];
} | null;

// 日期点
 type DatePointValue = {
    type: number;
    value: {
        year?: number | string;
        month?: number | string;
        quarter?: number | string;
        day?: number | string;
        hour?: number | string;
        minute?: number | string;
        second?: number | string;
        position?: number;
    };
} | null;

// 日期区间
 type DateRangeValue = {
    start: DatePointValue;
    end: DatePointValue;
} | null;

// 数值区间
 type NumberRangeValue = {
    min: string | number;
    max: string | number;
    closeMin: boolean;
    closeMax: boolean;
};

// 树
 type TreeValue = {
    [nodeName: string]: TreeValue;
};

// 树标签
 type TreeLabelValue = string[][];
```

---

如果你需要，我下一步可以继续把这份文档再整理成：

1. **按 TS 类型定义拆分的接口版**
2. **只保留“过滤组件速查表”的精简版**
3. **直接补到仓库某个 `docs/` 目录的正式文档版**


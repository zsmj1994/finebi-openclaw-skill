# finebi-querydata-sdk

`finebi-querydata-sdk` is the workspace SDK package used by `finebi-cli` to simulate a browser environment and query FineBI dashboard/widget data.

It is published as a public npm package and consumed by `finebi-cli` as a regular runtime dependency.

## Package contents

- `dist`
- `README.md`

## Usage

### Basic query

```typescript
import { FineBIQueryDataSDK } from 'finebi-querydata-sdk';

let sdk: FineBIQueryDataSDK | undefined;
try {
  // Initialize the SDK with a dashboard ID and server URL
  sdk = await FineBIQueryDataSDK.create({
    dashboardId: '6c5c1c5f38e6409889ca39537275da88',
    finebiServerUrl: 'http://192.168.5.102:38899/webroot/decision',
  });

  // Optionally apply a component filter
  sdk.filter?.applyFilter({
    widgetId: 'ef431839897df1c5',
    widgetType: 32,
    filterValue: {
      type: 1,
      value: ['基础财务'],
      assist: ['服务协议', '长期协议', '长期协议订单'],
    },
  });

  // Optionally apply a linkage (drill-through) value
  sdk.linkage?.applyLinkage('b5c048d05f6a81c9', {
    dId: '769956e753df1a55',
    fieldId: '69b6d5085ded437c82c76958caa1a75c_[603b][91d1][989d]',
    text: 360714.28571428574,
    value: [
      {
        dId: '1156cc321e910662',
        fieldId: '69b6d5085ded437c82c76958caa1a75c_[5408][540c][7c7b][578b]',
        text: '长期协议',
      },
    ],
  });

  // Query widget data by widget ID
  const result = await sdk.query?.getWidgetData('77bfd79358ab60cf');
  console.log(result.data);
} finally {
  sdk?.destroy();
}
```

`getWidgetData(widgetId, { compact })` compacts CHART response data by default, keeping only `resultType`, `shared`, and `geoms`; each geom's top-level `options` field is removed. Pass `{ compact: false }` only when the full response shape is required.

## Filter control value structures

`applyFilter` 的 `filterValue` 字段结构取决于组件的 `widgetType`。

> 按 `BICst.DESIGN.WIDGET` 常量顺序整理；仅保留出现在 `template.model.tsx` 的 `controlType` 分支中的过滤组件。

| 常量名 | 常量值 | `controlType` 映射控件 | 条件 / 分支说明 | 对外 value 结构 |
| --- | ---: | --- | --- | --- |
| `STRING` | `32` | `ControlStringText` / `ControlStringSingle` / `ControlStringMulti` / `ControlStringMultiNoBar` | `useCustom`、`customValue`、`singleSelect`、`dimensions`、`useParameter`、`useWidgetParameter` 共同决定 | `ControlWidgetStringValue \| null` |
| `NUMBER` | `33` | `ControlNumber` | 固定映射 | `{ min, max, closeMin, closeMax }` |
| `TREE` | `34` | `ControlTree` | 固定映射 | 树形对象 |
| `INTERVAL_SLIDER` | `36` | `ControlIntervalSlider` | 固定映射 | `{ min, max, closeMin: true, closeMax: true }` |
| `TREE_LABEL` | `38` | `ControlTreeLabel` | 固定映射 | `string[][]` |
| `NUMBER_DROP_DOWN` | `39` | `ControlStringText` / `ControlStringSingle` / `ControlStringMulti` / `ControlStringMultiNoBar` | 在 `controlType` 中和 `STRING` 走同一分支 | `ControlWidgetStringValue \| null` |
| `DATE_INTERVAL` | `48` | `ControlDateInterval` / `ControlDateIntervalTime` | `showTime === SHOW` 时走时间区间，否则走日期区间 | `{ start, end } \| null` |
| `YEAR` | `49` | `ControlYear` | 固定映射 | `{ type, value: { year } }` |
| `QUARTER` | `50` | `ControlQuarter` | 固定映射 | `{ type, value: { year, quarter } }` |
| `MONTH` | `51` | `ControlMonth` | 固定映射 | `{ type, value: { year, month } }` |
| `DATE` | `52` | `ControlDate` / `ControlDateTime` | `showTime === SHOW` 时带时分秒，否则为日期点 | `{ type, value: { year, month, day, hour?, minute?, second? } }` |
| `STRING_LIST` | `59` | `ControlStringText` / `ControlStringListSingle` / `ControlStringListMulti` / `ControlStringListMultiNoBar` | `useCustom`、`customValue`、`singleSelect`、`dimensions`、`useParameter`、`useWidgetParameter` 共同决定 | `ControlWidgetStringValue \| null` |
| `TREE_LIST` | `60` | `ControlTreeList` | 固定映射 | 树形对象 |
| `DATE_PANE` | `61` | `ControlDatePane` / `ControlDatePaneTime` | `showTime === SHOW` 时走带时间的日期面板 | `{ type, value: {...} } \| null` |
| `YEAR_MONTH_INTERVAL` | `62` | `ControlYearMonthInterval` | 固定映射 | `{ start, end }` |
| `TIME_GROUP` | `68` | `ControlDateGroup` | 固定映射 | `{ start, end }` |
| `STRING_GROUP` | `69` | `ControlStringText` / `ControlStringGroup` / `ControlMultiStringGroup` | `useCustom`、`customValue`、`singleSelect` 决定 | `ControlWidgetStringValue \| null` |

TypeScript 类型速查：

```ts
// 字符串/枚举型（STRING, NUMBER_DROP_DOWN, STRING_LIST, STRING_GROUP 等）
type StringLikeValue = {
  type: number;   // 1 = 多选(Multi), 0 = 全选(All)
  value: string[];
  assist: string[];
} | null;

// 日期单点（YEAR, QUARTER, MONTH, DATE, DATE_PANE）
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

// 日期区间（DATE_INTERVAL, YEAR_MONTH_INTERVAL, TIME_GROUP）
type DateRangeValue = {
  start: DatePointValue;
  end: DatePointValue;
} | null;

// 数值区间（NUMBER, INTERVAL_SLIDER）
type NumberRangeValue = {
  min: string | number;
  max: string | number;
  closeMin: boolean;
  closeMax: boolean;
};

// 树（TREE, TREE_LIST）
type TreeValue = {
  [nodeName: string]: TreeValue;
};

// 树标签（TREE_LABEL）
type TreeLabelValue = string[][];
```

> 详细说明（各控件分支条件、边界行为、NoBar 超限降级逻辑等）参见 [controlType-value-structures.md](./controlType-value-structures.md)。

## Development

```bash
pnpm build
pnpm typecheck
pnpm pack
```

## Notes

- The package embeds its bundled FineBI asset scripts at build time.
- Runtime API requests must provide `FINE_ACCESS_TOKEN`, which the SDK sends as `X-Fine-Access-Key`.
- `finebi-cli` should depend on this package through the workspace and use the SDK defaults instead of hardcoding asset paths.
- Release this package before `finebi-cli` whenever the CLI needs a newer SDK version.

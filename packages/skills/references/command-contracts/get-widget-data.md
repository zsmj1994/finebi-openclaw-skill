# get-widget-data

## Purpose

Fetch the data payload of a specific dashboard widget.

This command should be used only after the agent has resolved both:

- the dashboard id
- the target widget id from `get-dashboard-design-configure`

## CLI

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId>
```

Optional:

```bash
finebi-cli get-widget-data -r <reportId> -w <widgetId> --response-params '<json>'
```

## Input contract

- `reportId`: dashboard id
- `widgetId`: widget id from `reportWidgets`
- `responseParams`: optional pass-through query options for the SDK

## Required upstream lookup

Before calling this command, first call:

```bash
finebi-cli get-dashboard-design-configure -d <dashboardId>
```

Then inspect:

- `data.designConfigure.reportWidgets`

`reportWidgets` should be treated as:

- an object
- each object key is a widget id
- each object value is the widget configuration object

## Important widget semantics

Within `reportWidgets[widgetId]`:

- `type = 1`: a data widget that can be queried with `get-widget-data`
- `type = 2`: a filter control, not a data widget

## Response contract

Returns `ToolResult<any>` with the raw widget data payload from the FineBI query SDK.

The exact payload may vary by widget type and FineBI version.

## Important fields

### Upstream display fields

From the design config step, use widget display information such as:

- widget title-like fields when present
- widget layout or position hints when needed to disambiguate components

### Upstream workflow fields

- dashboard `reportId`
- `designConfigure.reportWidgets`
- widget id from the `reportWidgets` object key
- `reportWidgets[widgetId].type`

### Downstream result value

- the returned widget data payload

## Semantic notes

- Do not guess widget ids.
- Do not assume every widget in a dashboard is queryable.
- The widget id comes from the key of `reportWidgets`, not only from fields nested inside the widget config.
- `type = 2` means the component is a filter control and should not be treated as the target for `get-widget-data`.

## Common follow-up

1. Resolve the dashboard id
2. Call `get-dashboard-design-configure`
3. Inspect `designConfigure.reportWidgets`
4. Choose a widget whose config has `type = 1`
5. Use that widget's object key as `widgetId`
6. Call `get-widget-data -r <reportId> -w <widgetId>`

## Do

- Use `get-dashboard-design-configure` before `get-widget-data`
- Preserve both widget titles and widget ids during reasoning
- Filter out `type = 2` controls when the goal is to fetch data

## Do not

- Do not call `get-widget-data` with a filter control id
- Do not treat `reportWidgets` as an array
- Do not skip the dashboard configuration lookup when the widget id is not already known

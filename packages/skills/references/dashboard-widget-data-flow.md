# Dashboard Widget Data Flow

## Goal

Fetch the data of one or more queryable widgets from a dashboard.

This workflow is used when the user wants chart data, table data, or metric data from a dashboard component.

## When to use

Use this workflow when the user asks for any of the following:

- data behind a dashboard widget
- chart data from a dashboard
- table data from a dashboard component
- metrics shown by a specific dashboard block
- component-level dashboard analysis

## Required commands

- `get-dashboard-design-configure`
- `get-widget-data`

## Workflow

### Step 1: Resolve the dashboard id

First make sure the dashboard id is already known.

It may come from:

- `search-my-dashboards`
- `get-dashboards-by-subject`
- a published resource workflow

## Step 2: Load dashboard design configuration

Call:

```bash
finebi-cli get-dashboard-design-configure -d <dashboardId>
```

Expected result:

- dashboard configuration payload
- `designConfigure.reportWidgets`

## Step 3: Inspect `reportWidgets`

Treat `reportWidgets` as:

- an object
- each key is a widget id
- each value is the widget configuration for that widget id

Important field:

- `type = 1`: queryable data widget
- `type = 2`: filter control

## Step 4: Choose the target widget

When the user wants actual widget data:

- choose only widgets with `type = 1`

When more than one widget matches:

- show title-like fields or position hints
- ask the user to disambiguate if needed

## Step 5: Fetch widget data

Call:

```bash
finebi-cli get-widget-data -r <dashboardId> -w <widgetId>
```

Use:

- the known dashboard id as `reportId`
- the selected `reportWidgets` object key as `widgetId`

## Common mistakes

### Mistake 1: calling `get-widget-data` before reading dashboard config

Do not guess widget ids.

Correct flow:

```text
resolve dashboard id
-> get-dashboard-design-configure
-> inspect reportWidgets
-> choose type=1 widget
-> get-widget-data
```

### Mistake 2: treating `reportWidgets` as an array

`reportWidgets` is an object map.

The widget id is the object key.

### Mistake 3: querying filter controls

Do not use `type = 2` filter controls as the target of `get-widget-data`.

## Recommended agent behavior

1. Resolve the dashboard id first
2. Read `designConfigure.reportWidgets`
3. Separate queryable widgets from filter controls using `type`
4. Keep widget ids for machine steps
5. Keep widget titles or display hints for user explanation

## Short form

```text
resolve dashboard id
-> get-dashboard-design-configure(dashboardId)
-> inspect reportWidgets
-> choose key where type=1
-> get-widget-data(reportId=dashboardId, widgetId=thatKey)
```

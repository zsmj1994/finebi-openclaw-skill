# query-dataset

## Purpose

Search public FineBI datasets by keyword.

This command is used to locate candidate datasets before fetching preview data.

## CLI

```bash
finebi-cli query-dataset -k "<keyword>" -p 1 -s 150
```

## Input contract

- `keyword`: dataset search keyword
- `pageIndex`: result page index
- `pageSize`: result page size

## Response contract

The command returns the raw search payload wrapped in `ToolResult<any>`.

The exact payload may vary by FineBI version, but it should be treated as a dataset search result list.

## Important fields

### Display fields

- dataset display name fields such as `name`, `text`, or equivalent title fields when present
- description-like fields when present

### Workflow fields

- the dataset table identifier used as `tableName` in `preview-dataset-data`
- item identifiers that let the agent distinguish one dataset from another

## Semantic notes

- The most important output of this command is the dataset identifier needed for `preview-dataset-data`.
- In many FineBI responses, the dataset's name-like identifier is also the table identifier. The existing workflow in this repo assumes the chosen dataset id or name is passed as `tableName` to `preview-dataset-data`.
- If multiple datasets match, ask the user to choose using display fields, then keep the chosen workflow identifier.

## Common follow-up

1. Call `query-dataset`
2. Find the correct dataset candidate
3. Extract the dataset identifier used as `tableName`
4. Call `preview-dataset-data -t <tableName>`

## Do

- Use search results to narrow to a unique dataset
- Prefer showing names and descriptions when asking the user to disambiguate

## Do not

- Do not jump to preview without a concrete dataset identifier
- Do not assume the first result is correct when multiple close matches exist

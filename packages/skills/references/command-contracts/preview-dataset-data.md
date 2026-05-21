# preview-dataset-data

## Purpose

Fetch field metadata and preview records for a specific dataset table.

This command is usually called after `query-dataset`, once the correct dataset identifier is known.

## CLI

```bash
finebi-cli preview-dataset-data -t <tableName> -k "<keyword>" -l 5000 -p 1
```

## Input contract

- `tableName`: dataset table identifier
- `keyword`: optional field filter keyword
- `limit`: record limit
- `pageIndex`: preview page index

## Response contract

Returns a `ToolResult<any>` with the raw dataset preview payload from FineBI.

The payload should be interpreted as a combination of:

- field metadata
- preview records
- paging-related metadata

## Important fields

### Display fields

- field names
- field labels or descriptions when present
- preview rows or sample values

### Workflow fields

- the confirmed `tableName` context for downstream reasoning
- field identifiers or field names used for filtering, alert rules, or sync mappings
- paging metadata when additional preview requests are needed

## Semantic notes

- `tableName` is the key input workflow field; it should come from the dataset lookup step.
- The main value of this command is not only sample rows, but also field structure.
- For later workflows such as alerting, syncing, or report generation, keep both:
  - user-facing field names
  - machine-usable field identifiers or stable names

## Common follow-up

1. Call `query-dataset`
2. Resolve the correct dataset identifier
3. Call `preview-dataset-data`
4. Use returned field metadata to choose dimensions, metrics, filters, or mappings

## Do

- Use this command to confirm field structure before writing downstream logic
- Show a small preview to the user when they need help choosing fields

## Do not

- Do not invent field names or sample values
- Do not build alert or sync rules before confirming the actual field structure

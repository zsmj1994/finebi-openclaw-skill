# get-published-subject-resources

## Purpose

Return the resources exposed by a published analysis subject.

This command is usually called after `get-entry-tree`, using the selected node's `templateId`.

## CLI

```bash
finebi-cli get-published-subject-resources -t <publishTaskId>
```

## Input contract

- `taskId`: the published subject `templateId`, which is also the `publishTaskId`

## Response contract

Returns a `ToolResult<PublishedSubjectResource>`.

On success:

```json
{
  "success": true,
  "data": {
    "id": "resource-group-id",
    "name": "resource-group-name",
    "resourceList": [
      {
        "id": "resource-id",
        "name": "resource-name",
        "itemType": 1,
        "tableType": 1
      }
    ]
  }
}
```

## Important fields

### Display fields

- `name`: published resource group name
- `resourceList[].name`: resource display name

### Workflow fields

- `id`: resource group id
- `resourceList[].id`: downstream resource id for later actions
- `resourceList[].itemType`: resource category discriminator
- `resourceList[].tableType`: resource subtype discriminator

## Semantic notes

- The input to this command should come from `get-entry-tree.data[].templateId`.
- The result is not the entry node itself; it is the published resource bundle behind that entry.
- `resourceList[].id` is usually the key workflow field for later resource-specific actions.

## Common follow-up

1. Call `get-entry-tree`
2. Select the correct node
3. Read `templateId`
4. Call `get-published-subject-resources`
5. Inspect `resourceList[]` to decide the next action

## Do

- Keep both the bundle-level `id` and each `resourceList[].id`
- Show `name` fields to the user when asking them to choose a resource

## Do not

- Do not pass entry node `id` as `taskId`
- Do not assume every resource in `resourceList` has the same downstream use

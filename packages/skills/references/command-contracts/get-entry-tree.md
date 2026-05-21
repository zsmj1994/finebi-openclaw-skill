# get-entry-tree

## Purpose

Return the FineBI entry tree nodes the current user can access.

This command is mainly used to locate published entry nodes and extract the `templateId` needed by downstream commands.

## CLI

```bash
finebi-cli get-entry-tree
```

## Response contract

Returns a `ToolResult<EntryTreeNode[]>`.

On success:

```json
{
  "success": true,
  "data": [
    {
      "id": "node-id",
      "text": "display name",
      "path": "/path/to/node",
      "isParent": true,
      "templateId": "publish-task-id"
    }
  ]
}
```

## Important fields

### Display fields

- `text`: human-readable node name, some times is mean dashboard name
- `path`: display path of the node
- `fullParentName`: full parent display name when present
- `parentNames`: parent name chain

### Workflow fields

- `id`: current entry node id
- `templateId`: publish task id of the published subject behind this node
- `isParent`: whether the node has children

## Semantic notes

- `templateId` is the most important workflow field in this command.
- Do not treat `templateId` as display-only metadata.
- When the next step is to inspect published subject resources, use `templateId` as the input to `get-published-subject-resources`.
- Do not pass the entry node `id` into `get-published-subject-resources`.

## Common follow-up

1. Call `get-entry-tree`
2. Find the target node by `text` or `path`
3. Read that node's `templateId`
4. Call `get-published-subject-resources -t <templateId>`

## Do

- Use `text` and `path` to help the user identify the correct node
- Use `templateId` for the next published-resource lookup

## Do not

- Do not guess `templateId`
- Do not use node `id` where a publish task id is required
- Do not expose internal fields to the user unless they help the workflow

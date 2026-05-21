# Published Subject Resource Flow

## Goal

Find the resources exposed by a published analysis subject.

This workflow is used when the user wants to inspect what a published entry node actually exposes behind the scenes.

## When to use

Use this workflow when the user asks for any of the following:

- resources under an entry tree node
- published subject resources
- the dashboards, widgets, or bundled resources behind an entry
- what a specific published directory node points to

## Required commands

- `get-entry-tree`
- `get-published-subject-resources`

## Workflow

### Step 1: Load entry nodes

Call:

```bash
finebi-cli get-entry-tree
```

Expected result:

- a list of entry nodes the current user can access

Use these fields to identify the correct node:

- `text`
- `path`
- `fullParentName`

## Step 2: Select the target node

Find the node that matches the user's intended directory or published entry.

If there are multiple close matches:

- show `text` and `path`
- ask the user to choose the correct one

## Step 3: Extract `templateId`

From the selected node, read:

- `templateId`

This is the key workflow field for the next step.

## Step 4: Load published subject resources

Call:

```bash
finebi-cli get-published-subject-resources -t <templateId>
```

Expected result:

- the published resource bundle behind the selected entry node
- a `resourceList[]` that can be used for later resource-specific actions

## Output interpretation

### User-facing fields

- bundle `name`
- `resourceList[].name`

### Workflow fields

- bundle `id`
- `resourceList[].id`
- `resourceList[].itemType`
- `resourceList[].tableType`

## Common mistakes

### Mistake 1: using entry node `id` instead of `templateId`

Do not do this:

```text
get-entry-tree -> selectedNode.id -> get-published-subject-resources
```

Correct flow:

```text
get-entry-tree -> selectedNode.templateId -> get-published-subject-resources
```

### Mistake 2: treating `templateId` as display-only metadata

`templateId` is not a cosmetic field.

It is the publish task id required by the next command.

### Mistake 3: skipping disambiguation

If more than one node matches the user's wording, do not guess.

Ask the user to choose based on `text` and `path`.

## Recommended agent behavior

1. Resolve the entry node first
2. Preserve both display fields and workflow fields
3. Use `templateId` for downstream lookup
4. Use `resourceList[].name` to explain results to the user
5. Keep `resourceList[].id` for later machine steps

## Short form

```text
get-entry-tree
-> choose node by text/path
-> read templateId
-> get-published-subject-resources(templateId)
-> inspect resourceList
```

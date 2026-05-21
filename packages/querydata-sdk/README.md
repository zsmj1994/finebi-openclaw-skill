# finebi-querydata-sdk

`finebi-querydata-sdk` is the workspace SDK package used by `finebi-cli` to simulate a browser environment and query FineBI dashboard/widget data.

## Package contents

- `dist`
- `assets`
- `README.md`

## Development

```bash
pnpm build
pnpm typecheck
pnpm pack
```

## Notes

- The package expects the FineBI asset scripts under `assets/`.
- `finebi-cli` should depend on this package through the workspace and use the SDK defaults instead of hardcoding asset paths.

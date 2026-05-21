# finebi-querydata-sdk

`finebi-querydata-sdk` is the workspace SDK package used by `finebi-cli` to simulate a browser environment and query FineBI dashboard/widget data.

It is published as a public npm package and consumed by `finebi-cli` as a regular runtime dependency.

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
- Release this package before `finebi-cli` whenever the CLI needs a newer SDK version.

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

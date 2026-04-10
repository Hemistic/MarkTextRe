# MarkText Modern Example

This document is opened by default so the editor starts in a rendered Markdown state instead of an empty migration placeholder.

## Checklist

- Preserve the original MarkText visual style
- Keep Electron preload isolation
- Verify runtime behavior before handing it back

## Quote

> The modern shell should feel like MarkText, not a demo page.

## Table

| Item | Status | Notes |
| --- | --- | --- |
| Muya mount | In progress | Legacy compatibility bridge |
| Prism loader | Updated | Vite-safe dynamic loading |
| Default document | Ready | Opens this sample |

## Code

```ts
type Task = {
  id: string
  done: boolean
}

const tasks: Task[] = [
  { id: 'compatibility', done: true },
  { id: 'ui-clone', done: true },
  { id: 'final-polish', done: false }
]
```

```yaml
runtime:
  node: "24.x"
  electron: "41.x"
  renderer: "vite + vue"
```

## Math

Inline math works: $E = mc^2$

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

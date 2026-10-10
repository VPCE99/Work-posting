# Pre-refactor baseline (2026-10-10)

Captured before staged structural optimization per `高保真V1-代码优化执行计划.md`.

## Build

| Artifact | Raw | Gzip |
|---|---:|---:|
| CSS | 216.34 kB | 36.15 kB |
| JavaScript | 408.31 kB | 124.09 kB |

Commands: `npm run typecheck` pass, `npm run build` pass.

## Post phase 1–2 build (same day)

| Artifact | Raw | Gzip |
|---|---:|---:|
| CSS | 216.34 kB | 36.15 kB |
| JavaScript | 408.43 kB | 124.15 kB |

Checks after phase 1–2: `typecheck`, `typecheck:strict`, `test` (13), `test:e2e` (1), `build` all pass.
CSS raw/gzip unchanged; JS +0.12 kB raw from module boundaries only.

## Constraint

Subsequent phases must preserve current interaction and visual results.
No intentional product behavior changes until phase 8.

## Snapshot scope

Only `高保真V1/` editor-related sources on this branch tip.

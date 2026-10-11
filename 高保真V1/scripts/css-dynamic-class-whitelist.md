# CSS 动态类保护名单（死代码扫描白名单）

> 来源：`高保真V1-代码冗余与架构优化执行清单.md` §4.3 / §5  
> 机器可读副本：`scripts/css-dynamic-class-whitelist.json`（`npm run css:audit` 使用）  
> 用途：静态 class 扫描不得将以下模式判定为可删除 CSS。

## 模板字符串 / 动态拼接

| 模式 | 说明 |
| --- | --- |
| `modal--${size}` | `sm` / `md` / `lg` / `xl` |
| `modal--${variant}` | 如 `chart` |
| `toast--${tone}` | 如 `success` / `danger` |
| `status--${statusTone}` | 如 `progress` / `danger` / `success` |
| `chart-chip--${field.kind}` | `dimension` / `measure` |
| `editor-save-state--${saveStatus}` | 保存状态 |
| `template-preview-slide--${slide.kind}` | 模板预览幻灯片类型 |
| `template-preview-thumb__mock--${slide.kind}` | 模板缩略图 mock |

## 状态类（删除前必须检查条件拼接）

- `is-*`（如 `is-over`、`is-menu-open`、`is-selected`、`is-avg`、`is-spot`）
- `active` / `--active`
- `open` / `--open` / `aria-expanded`
- `selected` / `--selected`
- `disabled`

## 扫描建议

1. 先匹配上表白名单模式，命中则跳过。
2. 对状态类在 `src/**/*.{ts,tsx}` 中搜索模板字符串与条件 `className`。
3. 无法人工确认的 selector 只记入候选，不删除。

# utility.js 自訂依賴翻新指引

## Core Principles

- `<script src=".../utility.js">` 記錄路徑後直接移除
- `utility.js` 的工具函數一律改為從 `@/assets/utils/utility.js` 具名 import
- `utility.*` 命名空間改為直接 import 對應函數（移除 `utility.` 前綴）
- **FORBIDDEN**：禁止自行實作格式化或輸入驗證邏輯

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `addPrefix(str, len, prestr)` | `addPrefix(str, len, prestr)` | `import { addPrefix } from '@/assets/utils/utility.js'` |
| `MoneyFormat(inputString)` | `MoneyFormat(inputString)` | `import { MoneyFormat } from '@/assets/utils/utility.js'` |
| `DateFormat(strDate)` | `DateFormat(strDate)` | `import { DateFormat } from '@/assets/utils/utility.js'` |
| `timeForTextfield(timevalue)` | `timeForTextfield(timevalue)` | `import { timeForTextfield } from '@/assets/utils/utility.js'` |
| `formatCurrency(num)` | `formatCurrency(num)` | `import { formatCurrency } from '@/assets/utils/utility.js'` |
| `utility.keypressNumberOnly(isDot, isNegative)` | `keypressNumberOnly(keyCode, isDot, isNegative)` | `import { keypressNumberOnly } from '@/assets/utils/utility.js'`；簽章調整，移除全域 `event` 依賴，改傳入 `keyCode` |
| `utility.keypressNumberValue(obj, isDot, isNegative)` | `keypressNumberValue(keyCode, currentValue, isDot, isNegative)` | `import { keypressNumberValue } from '@/assets/utils/utility.js'`；簽章調整，移除全域 `event` 與 DOM 依賴；回傳 `{ allow: boolean, value: string }` |
| `submitToUpper(element)` | — | — |
| `submitOnce(...)` | — | — |
| `disableButton(theform)` | — | — |
| `enableButton(theform)` | — | — |
| `enableElements(elems)` | — | — |
| `stat()` | — | — |
| `fix()` | — | — |
| `coverDocument()` | — | — |
| `uncoverDocument()` | — | — |
| `utility.keep_eBAF_parameter(opt)` | — | — |
| `utility.keepResponseTimeEndParameters(uuid)` | — | — |
| `utility.overrideSubmitByForm(theForm)` | — | — |
| `CSS_Selectors.*` | — | — |
| `pageSupport.*` | — | — |
| `jump(current, next, len)` | `// TODO` | 自動跳欄，改為 Vue `@input` 事件實作 |
| `keyWordReplaceFullSpace(frm, keyWord, ingornCase)` | `// TODO` | 全型空白清除，改為 Vue computed / watcher 實作 |
| `replaceFullSpace(frm)` | `// TODO` | `keyWordReplaceFullSpace` 無關鍵字版本 |
| `trimSpace(frm)` | `// TODO` | 右側空白清除，改為 Vue computed / watcher 實作 |
| `copyKey(formx)` | `// TODO` | 查詢條件複製，頁面自行維護 ref 實作 |
| `showHintBox(bID)` | `// TODO` | 提示框顯示，改為 Vue 事件 + `v-show` 實作 |
| `hideHintBox(bID)` | `// TODO` | 提示框隱藏 |

# utility.js 翻新指引

## Core Principles

**REQUIRED**：
- `utility.js` 的工具函數一律改為從 `@/assets/utils/utility.js` 具名 import
- `utility.*` 命名空間的方法改為直接 import 對應函數（移除 `utility.` 命名空間）
- `keypressNumberOnly` / `keypressNumberValue` 的簽章變更：原始依賴全域 `event` 物件，翻新後改為明確傳入 `keyCode` 參數

**FORBIDDEN**：
- 禁止自行實作數字格式化、字串補位、時間標準化邏輯

---

## Rules

### 翻新對應速查表

#### 工具函數：`@/assets/utils/utility.js`

```js
import { xxx } from '@/assets/utils/utility.js'
```

| 原始呼叫 | 翻新呼叫 |
|---|---|
| `addPrefix(str, len, prestr)` | `addPrefix(str, len, prestr)` |
| `MoneyFormat(inputString)` | `MoneyFormat(inputString)` |
| `DateFormat(strDate)` | `DateFormat(strDate)` |
| `timeForTextfield(timevalue)` | `timeForTextfield(timevalue)` |
| `formatCurrency(num)` | `formatCurrency(num)` |
| `utility.keypressNumberOnly(isDot, isNegative)` | `keypressNumberOnly(event.keyCode, isDot, isNegative)` |
| `utility.keypressNumberValue(obj, isDot, isNegative)` | `keypressNumberValue(obj, event.keyCode, isDot, isNegative)` |

---

### 直接移除

| 原始呼叫 | 原因 |
|---|---|
| `submitToUpper(element)` | DOM 操作，Vue 無需手動大寫轉換 |
| `stat()` / `fix()` | DOM 操作，Vue 佈局不依賴此機制 |
| `coverDocument(doc)` / `uncoverDocument(doc)` | DOM 操作 |
| `submitOnce(button, openWindow, coverOnly)` | 框架層，`customAxios` 自然防重複 |
| `disableButton(theform)` / `enableButton(theform)` | DOM 操作，改用 `loading` ref 綁定 `:disable` |
| `enableElements(elems)` | DOM 操作，改用 Vue reactive 狀態控制 |
| `utility.overrideSubmitByForm(theForm)` | JSP 框架依賴 |
| `utility.keepResponseTimeEndParameters(uuid)` | JSP 框架依賴 |
| `utility.keep_eBAF_parameter(opt)` | JSP 框架依賴 |
| `CSS_Selectors.*` | DOM 操作，Vue 不需此工具 |
| `pageSupport.*` | JSP 環境依賴 |

### Fallback

| 原始呼叫 | 原因 |
|---|---|
| `copyKey(formx)` | DOM 操作，需人工確認替代方式 |
| `jump(current, next, len)` | DOM 操作，改用 `@input` 事件自行實作 |
| `keyWordReplaceFullSpace(frm, keyWord, ignoreCase?)` | DOM 操作，改用 `@blur` 事件自行實作 |
| `replaceFullSpace(frm)` | DOM 操作，改用 `@blur` 事件自行實作 |
| `trimSpace(frm)` | DOM 操作，改用 `@blur` 事件自行實作 |
| `showHintBox(bID)` / `hideHintBox(bID)` | 依賴全域 event 物件，無等價實作 |
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

### 不可翻新項目

| 原始呼叫 | 處理方式 |
|---|---|
| `submitToUpper(element)` | DOM 操作，直接移除（Vue 無需手動大寫轉換） |
| `copyKey(formx)` | DOM 操作，一律 Fallback |
| `stat()` / `fix()` | DOM 操作，直接移除（Vue 佈局不依賴此機制） |
| `jump(current, next, len)` | DOM 操作，改用 `@input` 事件自行實作，一律 Fallback |
| `coverDocument(doc)` / `uncoverDocument(doc)` | DOM 操作，直接移除 |
| `submitOnce(button, openWindow, coverOnly)` | 框架層邏輯，改用 `customAxios` 自然防重複，直接移除 |
| `disableButton(theform)` / `enableButton(theform)` | DOM 操作，改用 `loading` ref 綁定 `:disable`，直接移除 |
| `enableElements(elems)` | DOM 操作，改用 Vue reactive 狀態控制，直接移除 |
| `keyWordReplaceFullSpace(frm, keyWord, ignoreCase?)` | DOM 操作，改用 `@blur` 事件自行處理，一律 Fallback |
| `replaceFullSpace(frm)` | DOM 操作，改用 `@blur` 事件自行處理，一律 Fallback |
| `trimSpace(frm)` | DOM 操作，改用 `@blur` 事件自行處理，一律 Fallback |
| `showHintBox(bID)` / `hideHintBox(bID)` | DOM 操作，依賴全域 event 物件，一律 Fallback |
| `utility.overrideSubmitByForm(theForm)` | JSP 框架依賴，直接移除 |
| `utility.keepResponseTimeEndParameters(uuid)` | JSP 框架依賴，直接移除 |
| `utility.keep_eBAF_parameter(opt)` | JSP 框架依賴，直接移除 |
| `CSS_Selectors.*` | DOM 操作，Vue 不需此工具，直接移除 |
| `pageSupport.*` | DOM 操作，JSP 環境依賴，直接移除 |

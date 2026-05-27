# CSRUtil.js 翻新指引

## Core Principles

**REQUIRED**：
- `CSRUtil.*` 的工具函數一律改為從 `@/assets/utils/CSRUtil.js` 具名 import
- `CSRUtil.maskHandler.*` 的遮罩方法改為直接 import 對應函數（移除 `maskHandler.` 命名空間）

**FORBIDDEN**：
- 禁止自行實作數字格式化、遮罩、日期轉換邏輯

---

## Rules

### 翻新對應速查表

#### 工具函數：`@/assets/utils/CSRUtil.js`

```js
import { xxx } from '@/assets/utils/CSRUtil.js'
```

| 原始呼叫 | 翻新呼叫 |
|---|---|
| `CSRUtil.isSuccess(resp)` | `isSuccess(resp)` |
| `CSRUtil.getReturnMessage(resp)` | `getReturnMessage(resp)` |
| `CSRUtil.isOnProgress(xmlhttp)` | `isOnProgress(xmlhttp)` |
| `CSRUtil.$fmt(v, pattern, isInput?)` | `$fmt(v, pattern, isInput?)` |
| `CSRUtil.round(val, scale?)` | `round(val, scale?)` |
| `CSRUtil.parseDate(str)` | `parseDate(str)` |
| `CSRUtil.dateRange(d1, d2)` | `dateRange(d1, d2)` |
| `CSRUtil.pressNumber(code)` | `pressNumber(code)` |
| `CSRUtil.upNumber(code)` | `upNumber(code)` |
| `CSRUtil.getNumber(val)` | `getNumber(val)` |
| `Date.toROC(d)` | `toROC(d)` |
| `Date.toInputROC(d, delimiter)` | `toInputROC(d, delimiter)` |
| `CSRUtil.maskHandler.getMaskStr(str, beginIndex, maskLength, inSign?)` | `getMaskStr(str, beginIndex, maskLength, inSign?)` |
| `CSRUtil.maskHandler.getMaskID(str, maskLength?)` | `getMaskID(str, maskLength?)` |
| `CSRUtil.maskHandler.getMaskName(str, inSign?)` | `getMaskName(str, inSign?)` |
| `CSRUtil.maskHandler.getMaskAddress(str, inSign?)` | `getMaskAddress(str, inSign?)` |
| `CSRUtil.maskHandler.getMaskAddress2(str, inSign?)` | `getMaskAddress2(str, inSign?)` |

---

### 不可翻新項目

| 原始呼叫 | 處理方式 |
|---|---|
| `CSRUtil.voToInputs(panel_id, vo)` | DOM 操作，一律 Fallback |
| `CSRUtil.inputsToVo(panel_id, includeDisabled?)` | DOM 操作，一律 Fallback |
| `CSRUtil.createCoverPage(inputOpts)` | DOM 操作，一律 Fallback |
| `CSRUtil.AjaxHandler.request(...)` | 框架層邏輯，改用 `customAxios`，一律 Fallback |
| `CSRUtil.getMsgBoard(msg, returnCode)` | DOM frame 操作，一律 Fallback |
| `CSRUtil.clearTable(tableID)` | DOM 操作，一律 Fallback |
| `CSRUtil.mapToSelectOptions(e, m, d)` | DOM 操作，改用 `q-select`，一律 Fallback |
| `CSRUtil.listToSelectOptions(e, l, d)` | DOM 操作，改用 `q-select`，一律 Fallback |
| `CSRUtil.mark(elem)` / `CSRUtil.unmark(elem)` | DOM 操作，改用 VeeValidate `:error` binding，一律 Fallback |
| `CSRUtil.exportXls(...)` | 依賴舊 grid 元件，改用 `exportToXls`，一律 Fallback |
| `CSRUtil.linkTo(linkParams, formID?)` | 頁面導覽，改用 `router.push`，一律 Fallback |
| `CSRUtil.linkBack(backAction?, cbFuncOptions?)` | 頁面導覽，改用 `router.back()`，一律 Fallback |
| `CSRUtil.getLP_JSON(remove?)` | 頁面導覽狀態，一律 Fallback |
| `CSRUtil.isBackLink(formID?, backFunc?)` | 頁面導覽狀態，一律 Fallback |
| `CSRUtil.clearLP_JSON()` | 頁面導覽狀態，一律 Fallback |
| `CSRUtil.keepParamsManager.*` | 跨頁狀態管理，改用 Pinia store，一律 Fallback |
| `CSRUtil.UICore.isOnTheSys(sysId)` | JSP 環境依賴，一律 Fallback |
| `CSRUtil.hasInclude_jQuery()` / `CSRUtil.hasInclude_Prototype()` | JSP 環境依賴，直接移除 |
| `autoFormatToDate()` | DOM 操作，新專案由 `q-input` 事件處理取代，直接移除 |
| `autoFormatToNumber(elemID?)` | DOM 操作，新專案由 `q-input` 事件處理取代，直接移除 |

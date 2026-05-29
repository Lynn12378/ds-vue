# CSRUtil.js 自訂依賴翻新指引

## Core Principles

- `<script src=".../CSRUtil.js">` 記錄路徑後直接移除
- 純工具函式改為從 `@/assets/utils/CSRUtil.js` 具名 import
- `CSRUtil.maskHandler.*` 命名空間改為直接 import 對應函數（移除 `CSRUtil.maskHandler.` 前綴）
- 日期相關函式改從 `@/assets/utils/date.js` import（見備注）
- **FORBIDDEN**：禁止自行實作遮碼或大數計算邏輯

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `CSRUtil.getReturnMessage(resp)` | `getReturnMessage(resp)` | `import { getReturnMessage } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.isSuccess(resp)` | `isSuccess(resp)` | `import { isSuccess } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.round(val, scale)` | `round(val, scale)` | `import { round } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.getNumber(val)` | `getNumber(val)` | `import { getNumber } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.maskHandler.getMaskStr(...)` | `getMaskStr(...)` | `import { getMaskStr } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.maskHandler.getMaskID(...)` | `getMaskID(...)` | `import { getMaskID } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.maskHandler.getMaskName(...)` | `getMaskName(...)` | `import { getMaskName } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.maskHandler.getMaskAddress(...)` | `getMaskAddress(...)` | `import { getMaskAddress } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.maskHandler.getMaskAddress2(...)` | `getMaskAddress2(...)` | `import { getMaskAddress2 } from '@/assets/utils/CSRUtil.js'` |
| `CSRUtil.linkTo(linkParams, formID)` | `router.push({ name })` | LP_JSON 機制不遷移，query params 改由 `route.query` 或 Pinia 傳遞 |
| `CSRUtil.linkBack(backAction)` | `router.back()` | — |
| `Date.toROC(d)` | `toROC(Y2Kdate)` | `import { toROC } from '@/assets/utils/date.js'` |
| `Date.toInputROC(d, delimiter)` | `toROC(Y2Kdate)` | `import { toROC } from '@/assets/utils/date.js'`；delimiter 參數不遷移 |
| `CSRUtil.parseDate(str)` | `stringToDate_Y2K(str)` | `import { stringToDate_Y2K } from '@/assets/utils/date.js'` |
| `CSRUtil.dateRange(d1, d2)` | `diffDayY2K(d1, d2)` | `import { diffDayY2K } from '@/assets/utils/date.js'` |
| `String.emptyIf(str, replaceStr)` | `str ?? replaceStr` | — |
| `String.prototype.trim` | `str.trim()` | — |
| `CSRUtil.hasInclude_jQuery()` | — | — |
| `CSRUtil.hasInclude_Prototype()` | — | — |
| `CSRUtil.isOnProgress(xmlhttp)` | — | — |
| `CSRUtil.voToInputs(panel_id, vo)` | — | — |
| `CSRUtil.inputsToVo(panel_id)` | — | — |
| `CSRUtil.createCoverPage(inputOpts)` | — | — |
| `CSRUtil.AjaxHandler.request().post(...)` | — | — |
| `CSRUtil.getMsgBoard()` | — | — |
| `msgWin.*` | — | — |
| `autoFormatToDate()` | — | — |
| `autoFormatToNumber()` | — | — |
| `CSRUtil.mapToSelectOptions()` | — | — |
| `CSRUtil.listToSelectOptions()` | — | — |
| `CSRUtil.mark(elem)` | — | — |
| `CSRUtil.unmark(elem)` | — | — |
| `CSRUtil.clearTable(tableID)` | — | — |
| `CSRUtil.pressNumber(code)` | — | — |
| `CSRUtil.upNumber(code)` | — | — |
| `CSRUtil.UICore.*` | — | — |
| `CSRUtil.getLP_JSON()` | — | — |
| `CSRUtil.clearLP_JSON()` | — | — |
| `CSRUtil.isBackLink(formID, backFunc)` | — | — |
| `CSRUtil.keepParamsManager.*` | — | — |
| `CSRUtil.enableSessionStorage()` | — | — |
| `CSRUtil.$fmt(v, pattern, isInput)` | `// TODO` | 依賴 BigNumber，需評估引入套件取代 |
| `CSRUtil.exportXls(fileName, grids, sheetNames)` | `// TODO` | 依賴舊版 grid API，需配合新匯出機制重新實作 |
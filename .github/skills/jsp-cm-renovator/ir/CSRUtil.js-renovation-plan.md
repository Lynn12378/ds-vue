# CSRUtil.js 翻新計畫

## 業務功能清單

1. **Ajax 請求** — `CSRUtil.AjaxHandler.request().post()`，封裝 jQuery/Prototype Ajax POST，含 cover page、訊息顯示、retry 控制
2. **回應解析** — `CSRUtil.getReturnMessage(resp)`、`CSRUtil.isSuccess(resp)`，從 response 解析 ErrMsg 與 returnCode
3. **訊息顯示** — `CSRUtil.getMsgBoard()`、`msgWin.show()`，將訊息寫入 frame 中的訊息板或彈出對話框
4. **遮罩管理** — `CSRUtil.createCoverPage()`，建立半透明遮罩 div
5. **DOM ↔ 物件互轉** — `CSRUtil.voToInputs()`、`CSRUtil.inputsToVo()`，JS 物件與 form input 雙向同步
6. **頁面導覽** — `CSRUtil.linkTo()`、`CSRUtil.linkBack()`、`CSRUtil.isBackLink()`，含 LP_JSON 序列化與跨頁面保留查詢條件
7. **LP_JSON 管理** — `CSRUtil.getLP_JSON()`、`CSRUtil.clearLP_JSON()`，維護跨頁面導覽參數堆疊
8. **跨頁面保留參數** — `CSRUtil.keepParamsManager.*`，於 top window / sessionStorage 保留參數，含 put/get/setPageValue
9. **數值格式化** — `CSRUtil.$fmt(v, pattern, isInput)` 搭配 `BigNumber` 類別，依指定 pattern 格式化大數
10. **遮碼工具** — `CSRUtil.maskHandler.*`，純字串遮碼函式（身分證、姓名、地址等）
11. **數學工具** — `CSRUtil.round(val, scale)` 四捨五入、`CSRUtil.getNumber(val)` 安全數字轉換
12. **日期工具** — `CSRUtil.parseDate()`、`CSRUtil.dateRange()`、`Date.toROC()`、`Date.toInputROC()`，日期解析與轉換
13. **DOM 格式輸入** — `autoFormatToDate()`、`autoFormatToNumber()`，DOM 事件綁定自動格式化輸入欄位
14. **Select 操作** — `CSRUtil.mapToSelectOptions()`、`CSRUtil.listToSelectOptions()`，將物件/陣列寫入 select options
15. **表格操作** — `CSRUtil.clearTable(tableID)`，清除 table 列
16. **錯誤標記** — `CSRUtil.mark(elem)`、`CSRUtil.unmark(elem)`，背景色標紅/還原
17. **XLS 匯出** — `CSRUtil.exportXls(fileName, grids, sheetNames)`，依舊版 grid API 匯出 Excel
18. **按鍵判斷** — `CSRUtil.pressNumber(code)`、`CSRUtil.upNumber(code)`，判斷 keypress/keyup 是否為數字鍵
19. **環境判斷** — `CSRUtil.hasInclude_jQuery()`、`CSRUtil.hasInclude_Prototype()`、`CSRUtil.UICore.*`，偵測 JS 函式庫與子系統識別
20. **字串工具** — `String.emptyIf()`、`String.prototype.trim` 原型擴充

---

## 翻新計畫

### 翻新對照表

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
| `Date.toROC(d)` / `Date.toInputROC(d, delimiter)` | `toROC(Y2Kdate)` | `import { toROC } from '@/assets/utils/date.js'` |
| `CSRUtil.parseDate(str)` | `stringToDate_Y2K(str)` | `import { stringToDate_Y2K } from '@/assets/utils/date.js'` |
| `CSRUtil.dateRange(d1, d2)` | `diffDayY2K(d1, d2)` | `import { diffDayY2K } from '@/assets/utils/date.js'` |
| `String.emptyIf(str, replaceStr)` | `str ?? replaceStr` | nullish coalescing 取代 |
| `String.prototype.trim` | `str.trim()` | — |
| `CSRUtil.hasInclude_jQuery()` | — | — |
| `CSRUtil.hasInclude_Prototype()` | — | — |
| `CSRUtil.isOnProgress(xmlhttp)` | — | — |
| `CSRUtil.voToInputs(panel_id, vo)` | — | — |
| `CSRUtil.inputsToVo(panel_id)` | — | — |
| `CSRUtil.createCoverPage(inputOpts)` | — | — |
| `CSRUtil.AjaxHandler.request().post(...)` | — | — |
| `CSRUtil.getMsgBoard()` / `msgWin.*` | — | — |
| `autoFormatToDate()` | — | — |
| `autoFormatToNumber()` | — | — |
| `CSRUtil.mapToSelectOptions()` | — | — |
| `CSRUtil.listToSelectOptions()` | — | — |
| `CSRUtil.mark(elem)` / `CSRUtil.unmark(elem)` | — | — |
| `CSRUtil.clearTable(tableID)` | — | — |
| `CSRUtil.pressNumber(code)` / `CSRUtil.upNumber(code)` | — | `keypressNumberOnly` 取代 |
| `CSRUtil.UICore.*` | — | — |
| `CSRUtil.getLP_JSON()` / `CSRUtil.clearLP_JSON()` | — | — |
| `CSRUtil.isBackLink(formID, backFunc)` | — | — |
| `CSRUtil.keepParamsManager.*` | — | — |
| `CSRUtil.enableSessionStorage()` | — | — |
| `CSRUtil.$fmt(v, pattern, isInput)` | `// TODO` | 依賴 BigNumber，需評估引入 `bignumber.js` 套件取代 |
| `CSRUtil.exportXls(fileName, grids, sheetNames)` | `// TODO` | 依賴舊版 grid API，需配合新匯出機制重新實作 |

### 建議建立的檔案

#### `@/assets/utils/CSRUtil.js`
遷移功能：**功能 2、10、11**（純工具函式：回應解析、遮碼、數學工具）

重構要點：
- 全面改用 ES6+ 語法（`const`/`let`、`export`、`??` 等）
- `maskHandler.*` 拆解為具名 export，移除命名空間
- `CSRUtil.round` / `CSRUtil.getNumber` 直接 export
- 移除所有 Prototype.js / jQuery 依賴

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 9（`CSRUtil.$fmt`） | 是否引入 `bignumber.js` 套件？或改用其他大數計算方案？ |
| 功能 17（`CSRUtil.exportXls`） | 新版匯出機制為何？是否改用後端 API 匯出？ |

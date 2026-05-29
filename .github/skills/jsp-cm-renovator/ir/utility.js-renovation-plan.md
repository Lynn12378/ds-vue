# utility.js 翻新計畫

## 業務功能清單

1. **字串補位** — `addPrefix(str, len, prestr)`，字串前補指定字元至目標長度
2. **金額格式化** — `MoneyFormat(inputString)`，數字轉千分位格式（`123,456,789`）
3. **民國日期格式化** — `DateFormat(strDate)`，轉換為 `92.01.01` 格式
4. **DB 時間格式化** — `timeForTextfield(timevalue)`，`hh:mm:ss` → `hhmmss`
5. **貨幣格式化** — `formatCurrency(num)`，數字轉含小數點的千分位格式
6. **數字鍵盤驗證** — `utility.keypressNumberOnly(isDot, isNegative)`，判斷按鍵是否為合法數字鍵
7. **數值輸入驗證** — `utility.keypressNumberValue(obj, isDot, isNegative)`，含負號/小數點的數值輸入控制
8. **小寫轉大寫** — `submitToUpper(element)`，submit 時將 text input 轉大寫（EMAIL 欄位例外）
9. **防重複送出** — `submitOnce()`、`disableButton()`，submit 後加 cover overlay + 停用按鈕
10. **按鈕啟用** — `enableButton(theform)`，啟用 form 內所有 submit/button
11. **欄位啟用** — `enableElements(elems)`，依 ID 清單啟用指定欄位
12. **自動跳欄** — `jump(current_element, next_element, len)`，達指定長度後自動 focus 下一欄位
13. **全型空白清除** — `keyWordReplaceFullSpace()`、`replaceFullSpace()`，清除 text/hidden 欄位的全型空白
14. **右側空白清除** — `trimSpace(frm)`，清除 text/hidden 欄位右側空白
15. **查詢條件複製** — `copyKey(formx)`，將 `K_` 開頭的 hidden 欄位複製對應欄位值
16. **版面固定** — `stat()`、`fix()`，固定頁面 MainTitle 位置（依賴 `bar1` DOM）
17. **遮罩蓋板** — `coverDocument()`、`uncoverDocument()`，在指定 document 上加/移除半透明遮罩
18. **提示框顯示** — `showHintBox(bID)`、`hideHintBox(bID)`，依滑鼠位置顯示/隱藏提示框（依賴全域 `event` 物件）
19. **eBAF 參數保留** — `utility.keep_eBAF_parameter(opt)`、`utility.keepResponseTimeEndParameters(uuid)`，JSP 框架參數傳遞機制
20. **Form Submit 覆寫** — `utility.overrideSubmitByForm(theForm)`，JSP form submit 事件覆寫機制
21. **DOM 屬性篩選工具** — `CSS_Selectors.*`，依屬性篩選 DOM 元素集合
22. **頁面支援資訊** — `pageSupport.*`，查詢功能負責人資訊並顯示於頁面標題列

---

## 翻新計畫

### 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `addPrefix(str, len, prestr)` | `addPrefix(str, len, prestr)` | `import { addPrefix } from '@/assets/utils/utility.js'` |
| `MoneyFormat(inputString)` | `MoneyFormat(inputString)` | `import { MoneyFormat } from '@/assets/utils/utility.js'` |
| `DateFormat(strDate)` | `DateFormat(strDate)` | `import { DateFormat } from '@/assets/utils/utility.js'` |
| `timeForTextfield(timevalue)` | `timeForTextfield(timevalue)` | `import { timeForTextfield } from '@/assets/utils/utility.js'` |
| `formatCurrency(num)` | `formatCurrency(num)` | `import { formatCurrency } from '@/assets/utils/utility.js'` |
| `utility.keypressNumberOnly(isDot, isNegative)` | `keypressNumberOnly(keyCode, isDot, isNegative)` | `import { keypressNumberOnly } from '@/assets/utils/utility.js'`；簽章調整，移除全域 `event` 依賴 |
| `utility.keypressNumberValue(obj, isDot, isNegative)` | `keypressNumberValue(keyCode, currentValue, isDot, isNegative)` | `import { keypressNumberValue } from '@/assets/utils/utility.js'`；簽章調整，移除全域 `event` 與 DOM 依賴 |
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
| `jump(current, next, len)` | `// TODO` | 自動跳欄，需改為 Vue `@input` 事件實作 |
| `keyWordReplaceFullSpace(frm, keyWord, ingornCase)` | `// TODO` | 全型空白清除，需改為 Vue computed / watcher 實作 |
| `replaceFullSpace(frm)` | `// TODO` | `keyWordReplaceFullSpace` 無關鍵字版本 |
| `trimSpace(frm)` | `// TODO` | 右側空白清除，需改為 Vue computed / watcher 實作 |
| `copyKey(formx)` | `// TODO` | 查詢條件複製，需改為頁面自行維護 ref 實作 |
| `showHintBox(bID)` | `// TODO` | 提示框顯示，依賴全域 `event`，需改為 Vue 事件 + `v-show` 實作 |
| `hideHintBox(bID)` | `// TODO` | 提示框隱藏 |

### 建議建立的檔案

#### `@/assets/utils/utility.js`
遷移功能：**功能 1–7**（所有可遷移的純工具函式）

重構要點：
- 全面改用 ES6+ 語法（`const`/`let`、`export`、`padStart()`、template literals）
- `keypressNumberOnly` 簽章調整：移除全域 `event` 依賴，改為傳入 `keyCode`
- `keypressNumberValue` 簽章調整：移除全域 `event` 與 DOM `obj` 依賴，改為傳入 `keyCode` 與 `currentValue`，回傳 `{ allow: boolean, value: string }`

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 12（`jump`） | 自動跳欄邏輯是否仍需保留？若是，改為 `@input` 事件處理 |
| 功能 13、14（全型空白、右側空白） | 是否改為 computed / watcher 自動處理，或保留送出前手動呼叫？ |
| 功能 15（`copyKey`） | 查詢條件複製邏輯是否仍需保留？若是，頁面自行維護對應 ref |
| 功能 18（`showHintBox`/`hideHintBox`） | 提示框 UI 是否改用 Quasar `q-tooltip` 取代？ |

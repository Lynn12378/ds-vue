# `jsp_CM/RPTUtil.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/RPTUtil.js`
- 目標：列印、下載、產檔、安全列印、條碼 URL
- 對應模組：
  - `src/composables/useReportTask.js`
  - `src/service/reportService.js`
  - `src/assets/utils/legacy/rptUtilPure.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `RPTUtil.executePrint(...)` | `executePrintReport(options)` | `ONE_TO_ONE_REPLACE` | 參數需先整理為 `parameterEntries` |
| `RPTUtil.download(...)` / `downloadFile(...)` | `executeDownloadReport(options)` | `ONE_TO_ONE_REPLACE` | 是否另開視窗保留 `isOpenNewBrowse` |
| `executeCreateXlsFile(...)` | `executeCreateXlsFile(taskOptions)` | `ONE_TO_ONE_REPLACE` | 任務建立後由後端回傳 taskId |
| `executeCreateCsvFile(...)` | `executeCreateCsvFile(taskOptions)` | `ONE_TO_ONE_REPLACE` | 同上 |
| `executeSecurityPrintHandler(...)` | `buildSecurityPrintOptions(...)` + `executePrintReport(...)` | `ONE_TO_ONE_REPLACE` | 保留加密檔案參數 |
| `createHiddenElementByPrintParameter(...)` | 以 `buildPrintParameterEntries` 產生 entries | `DIRECT_REMOVE` | 不再手動 append hidden input |
| `genBarcode(...)` | `buildBarcodeUrl(options)` | `ONE_TO_ONE_REPLACE` | URL query 參數規則不變 |

## 建議改寫骨架
```js
import { useReportTask } from '@/composables/useReportTask.js'
import { buildPrintParameterEntries } from '@/assets/utils/legacy/rptUtilPure.js'

const { executePrintReport } = useReportTask()

await executePrintReport({
  parameterEntries: buildPrintParameterEntries({
    pageIds,
    rptParams,
    rptDetails,
    IS_TIFF: isTiff ? 'Y' : ''
  }),
  isOpenNewBrowse: true
})
```

## 契約要求
- 原 `RPT_URL/RPT_PARAM/RPT_DETAIL` 的順序與重複筆數邏輯必須保留。
- 安全列印參數（如 `encryptTempFileFullPath`）不可遺失。
- 下載檔名（`downloadFileName`）需完整保留。

## 直接移除清單
- 使用 jQuery/DOM 直接建立 hidden form 再 submit 的頁面端程式。
- 直接在頁面組字串 `window.open` 屬性並散落多處。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `buildLegacyReportOptions(legacyArgs)`，先轉成 `executePrintReport/executeDownloadReport` 可接受格式。

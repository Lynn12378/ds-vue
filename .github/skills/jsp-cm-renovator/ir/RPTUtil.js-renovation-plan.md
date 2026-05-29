# RPTUtil.js 翻新計畫

## 業務功能清單

1. **報表列印** — `executePrintHandler(options)`、`executePrint(pageIds, rptParams, rptDetails, isOpenNewBrowse, isTiff)`，組裝報表參數後透過 `RptServlet` 產生報表，於新視窗開啟
2. **AJAX 後列印** — `executePrintByLink(requestURL, params, isOpenNewBrowse)`，先發送 AJAX 查詢後依 response 執行列印
3. **依 response 列印** — `executePrintByResponse(resp, isOpenNewBrowse)`，從 response 取出報表路徑直接列印
4. **安全列印** — `executeSecurityPrintHandler(resp, isOpenNewBrowse, beforeActions, isIndependent)`、`executeSecurityPrintByResponse(resp, isOpenNewBrowse, isIndependent)`，透過 `AppletServlet` 執行含浮水印的安全列印
5. **報表資料下載** — `downloadPrintData(pageIds, rptParams, rptDetails, downloadFileName, isTiff)`，下載報表產生的 PDF / TIFF 檔案
6. **XLS / CSV 下載** — `executeCreateXlsFile(requestURL, params, isOpenNewBrowse)`、`executeCreateCsvFile(requestURL, params)`，先 AJAX 查詢後透過 `XlsServlet` 下載試算表
7. **檔案下載** — `downloadFile(requestURL, params, isOpenNewBrowse)`、`download(options)`，先 AJAX 查詢後透過 `FileDownloadServlet` 下載指定檔案
8. **檔案監控下載** — `fileWatchDog(requestURL, params)`、`fileWatchDog4WaterMark(requestURL, params)`，AJAX 查詢後透過 `FileWatchDog` 開啟加密檔案（含浮水印變體）
9. **Barcode 產生** — `genBarcode(options, node)`，呼叫 `BarcodeGenerator` Servlet 產生 barcode 圖片
10. **Hidden Input 建立** — `createHiddenElementByPrintParameter(n, v)`，建立 hidden input DOM 元素（供內部 form 組裝使用）

---

## 翻新計畫

### 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `RPTUtil.createHiddenElementByPrintParameter(n, v)` | `// TODO` | — |
| `RPTUtil.executePrintHandler(options)` | `// TODO` | — |
| `RPTUtil.executePrint(pageIds, rptParams, rptDetails, isOpenNewBrowse, isTiff?)` | `// TODO` | — |
| `RPTUtil.executePrintByLink(requestURL, params, isOpenNewBrowse)` | `// TODO` | — |
| `RPTUtil.executePrintByResponse(resp, isOpenNewBrowse)` | `// TODO` | — |
| `RPTUtil.executeSecurityPrintHandler(resp, isOpenNewBrowse, beforeActions, isIndependent)` | `// TODO` | — |
| `RPTUtil.executeSecurityPrintByResponse(resp, isOpenNewBrowse, isIndependent)` | `// TODO` | — |
| `RPTUtil.downloadPrintData(pageIds, rptParams, rptDetails, downloadFileName, isTiff?)` | `// TODO` | — |
| `RPTUtil.executeCreateXlsFile(requestURL, params, isOpenNewBrowse)` | `// TODO` | — |
| `RPTUtil.executeCreateCsvFile(requestURL, params)` | `// TODO` | — |
| `RPTUtil.downloadFile(requestURL, params, isOpenNewBrowse)` | `// TODO` | — |
| `RPTUtil.download(options)` | `// TODO` | — |
| `RPTUtil.fileWatchDog(requestURL, params)` | `// TODO` | — |
| `RPTUtil.fileWatchDog4WaterMark(requestURL, params)` | `// TODO` | — |
| `RPTUtil.genBarcode(options, node)` | `// TODO` | — |

### 說明

所有 `RPTUtil.*` 方法全數為 `// TODO`：
- 所有功能均透過向 Legacy Servlet（`RptServlet`、`AppletServlet`、`XlsServlet`、`FileDownloadServlet`、`FileWatchDog`、`BarcodeGenerator`）提交 form 驅動
- 無可直接遷移的純工具函式

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 1–8 | 新架構下各 Servlet 的 API 路徑與協定為何？是否改為 `/api/` 前綴？ |
| 功能 6（XLS / CSV） | 是否改由前端 SheetJS 產生？或維持後端 XlsServlet？ |
| 功能 9（Barcode） | 是否改用前端 barcode 套件產生？ |

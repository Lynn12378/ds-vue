# RPTUtil.js 業務邏輯分析

## 結論

RPTUtil.js 所有 public 方法均依賴以下無法在 Vue 翻新環境中重現的機制：

1. **JSP Servlet 架構**：所有列印、下載、XLS 產生動作均透過建立 HTML `<form>` 並 POST 至後端 JSP Servlet（RptServlet、AppletServlet、XlsServlet、FileDownloadServlet、FileWatchDog、BarcodeGenerator）
2. **同步 Ajax**（`async: false`）：依賴 Prototype.js 或 jQuery 的同步請求，Vue 翻新後改用 `customAxios` 非同步處理
3. **DOM 操作**：動態建立 `<form>`、`<span>`、`<input type="hidden">` 並直接操作 `document.body`

因此 RPTUtil.js **無任何可遷移的純工具函數**，所有功能一律 Fallback。

---

## Public Functions

- [ ] `RPTUtil.createHiddenElementByPrintParameter(n, v)` — 建立一個 hidden `<input>` DOM 元素，供表單送出使用（DOM 操作）
- [ ] `RPTUtil.executePrintHandler(options)` — 組裝列印參數並 POST 至後端 RptServlet 開啟列印（DOM 操作 + JSP Servlet）
- [ ] `RPTUtil.executePrint(pageIds, rptParams, rptDetails, isOpenNewBrowse, isTiff)` — 直接傳入列印參數執行列印（DOM 操作 + JSP Servlet）
- [ ] `RPTUtil.executePrintByLink(requestURL, params, isOpenNewBrowse)` — 先發送 Ajax 查詢，再依回應執行列印（同步 Ajax + DOM 操作）
- [ ] `RPTUtil.executePrintByResponse(resp, isOpenNewBrowse)` — 依 Ajax 回應物件執行列印（DOM 操作 + JSP Servlet）
- [ ] `RPTUtil.executeSecurityPrintHandler(resp, isOpenNewBrowse, beforeActions, isIndependent)` — 執行安全列印（含浮水印），依回應物件送出至 AppletServlet（DOM 操作）
- [ ] `RPTUtil.executeSecurityPrintByResponse(resp, isOpenNewBrowse, isIndependent)` — 依回應物件執行安全列印（DOM 操作）
- [ ] `RPTUtil.downloadPrintData(pageIds, rptParams, rptDetails, downloadFileName, isTiff)` — 下載列印資料（DOM 操作 + JSP Servlet）
- [ ] `RPTUtil.executeCreateXlsFile(requestURL, params, isOpenNewBrowse)` — 先發送 Ajax 查詢，依回應下載 XLS 檔案（同步 Ajax + DOM 操作）
- [ ] `RPTUtil.executeCreateCsvFile(requestURL, params)` — 下載 CSV 檔案，內部呼叫 `executeCreateXlsFile`（同步 Ajax + DOM 操作）
- [ ] `RPTUtil.downloadFile(requestURL, params, isOpenNewBrowse)` — 先發送 Ajax 查詢，依回應下載一般檔案（同步 Ajax + DOM 操作）
- [ ] `RPTUtil.download(options)` — 直接下載加密檔案，POST 至 FileDownloadServlet（DOM 操作 + JSP Servlet）
- [ ] `RPTUtil.fileWatchDog(requestURL, params)` — 先發送 Ajax 查詢，開啟 FileWatchDog 視窗顯示加密暫存檔（同步 Ajax + window.open）
- [ ] `RPTUtil.fileWatchDog4WaterMark(requestURL, params)` — 帶浮水印版本的 fileWatchDog（同步 Ajax + window.open）
- [ ] `RPTUtil.genBarcode(options, node)` — 建立指向後端 BarcodeGenerator Servlet 的 `<img>` 元素（DOM 操作 + JSP Servlet URL）

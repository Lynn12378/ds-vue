# RPTUtil.js 自訂依賴翻新指引

## Core Principles

- `<script src=".../RPTUtil.js">` 記錄路徑後直接移除
- 所有 `RPTUtil.*` 呼叫全數標注 `// TODO`，待後端 Servlet API 路徑與協定確認後實作

---

## 翻新對照表

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

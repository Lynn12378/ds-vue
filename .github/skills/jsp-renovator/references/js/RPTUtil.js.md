# RPTUtil.js 翻新指引

## Core Principles

**REQUIRED**：
- `RPTUtil.*` 的所有呼叫一律 Fallback，無對應翻新實作

**FORBIDDEN**：
- 禁止自行實作 RPTUtil 的列印、下載、XLS 產生邏輯

---

## Rules

### 翻新對應速查表

RPTUtil.js 全部功能依賴 JSP Servlet 架構與同步 Ajax，**無任何可翻新的工具函數**。

| 原始呼叫 | 處理方式 |
|---|---|
| `RPTUtil.createHiddenElementByPrintParameter(n, v)` | 一律 Fallback |
| `RPTUtil.executePrintHandler(options)` | 一律 Fallback |
| `RPTUtil.executePrint(pageIds, rptParams, rptDetails, isOpenNewBrowse, isTiff?)` | 一律 Fallback |
| `RPTUtil.executePrintByLink(requestURL, params, isOpenNewBrowse)` | 一律 Fallback |
| `RPTUtil.executePrintByResponse(resp, isOpenNewBrowse)` | 一律 Fallback |
| `RPTUtil.executeSecurityPrintHandler(resp, isOpenNewBrowse, beforeActions, isIndependent)` | 一律 Fallback |
| `RPTUtil.executeSecurityPrintByResponse(resp, isOpenNewBrowse, isIndependent)` | 一律 Fallback |
| `RPTUtil.downloadPrintData(pageIds, rptParams, rptDetails, downloadFileName, isTiff?)` | 一律 Fallback |
| `RPTUtil.executeCreateXlsFile(requestURL, params, isOpenNewBrowse)` | 一律 Fallback |
| `RPTUtil.executeCreateCsvFile(requestURL, params)` | 一律 Fallback |
| `RPTUtil.downloadFile(requestURL, params, isOpenNewBrowse)` | 一律 Fallback |
| `RPTUtil.download(options)` | 一律 Fallback |
| `RPTUtil.fileWatchDog(requestURL, params)` | 一律 Fallback |
| `RPTUtil.fileWatchDog4WaterMark(requestURL, params)` | 一律 Fallback |
| `RPTUtil.genBarcode(options, node)` | 一律 Fallback |

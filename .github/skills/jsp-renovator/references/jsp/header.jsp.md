# header.jsp 自訂依賴翻新指引

## Core Principles

- `<%@ include file=".../header.jsp" %>` 記錄路徑後直接移除
- `header.jsp` 已翻新為 `CustomHeader`（`@/components/layout/CustomHeader.vue`），由 `BaseLayout.vue` 自動載入，頁面無需任何對應處理

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `window.charCountsByte` | — | — |
| `utility.keep_eBAF_parameter(opt)` | — | — |
| `utility.keepResponseTimeEndParameters(uuid)` | — | — |
| `@font-face` EUDC 難字字型 | — | 改由全域 CSS 統一載入 |
| `frame` 架構的 `watermark_root` | — | — |
| PD_CTRL 資安管控 | — | `CustomHeader` 自動處理 |
| IS_WATERMARK 浮水印 | — | `CustomHeader` 自動處理 |
| `applyByFuncId(funcId)` | `customHeaderRef.value.applyByFuncId(funcId)` | 特殊業務需要時，透過 ref 呼叫 |
| `enablePdCtrl(funcId)` | `customHeaderRef.value.enablePdCtrl()` | 特殊業務需要時 |
| `disablePdCtrl()` | `customHeaderRef.value.disablePdCtrl()` | 特殊業務需要時 |
| `enableWatermark(userId)` | `customHeaderRef.value.enableWatermark()` | 特殊業務需要時 |
| `disableWatermark()` | `customHeaderRef.value.disableWatermark()` | 特殊業務需要時 |

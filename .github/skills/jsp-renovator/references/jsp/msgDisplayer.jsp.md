# msgDisplayer.jsp 自訂依賴翻新指引

## Core Principles

- `<%@ include file=".../msgDisplayer.jsp" %>` 記錄路徑後直接移除
- `msgDisplayer.jsp` 已翻新為 `CustomFooter`（`@/components/layout/CustomFooter.vue`），由 `BaseLayout.vue` 自動載入，頁面無需任何對應處理
- 後端 `ReturnMessage` 序列化由 `customAxios` 攔截器統一處理，頁面不需關注 `msgs[]`

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `msgs[]` | — | 改由 `customAxios` 攔截器解析 |
| `alertMessages()` | — | `CustomFooter` 自動處理 |
| `displayMessage()` | — | `CustomFooter` 自動處理 |
| `msgDisplayer.getBottomFrame()` | — | frame 架構不復存在 |
| `msgDisplayer.clearBottomMsg()` | — | `customAxios` 請求前自動清除 |
| `getMsgBoard()` | — | — |
| `txHasRollbackPage` flag | — | — |
| `document.onclick` 清除訊息 | — | `customAxios` 請求前自動清除 |
| `showMessages(msgs)` | `customFooterRef.value.showMessages(msgs)` | 特殊業務需要時，透過 ref 手動觸發 |
| `clearMessages()` | `customFooterRef.value.clearMessages()` | 特殊業務需要時，透過 ref 手動清除 |
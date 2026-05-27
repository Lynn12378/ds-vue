# msgDisplayer.jsp 翻新指引

## Core Principles

**REQUIRED**：
- `msgDisplayer.jsp` 已翻新為 `MsgDisplayer`（`@/components/layout/MsgDisplayer.vue`），由 `BaseLayout.vue` 自動 include
- 翻新單一 JSP 時直接移除所有 `msgDisplayer.jsp` 引用，無需任何對應處理

---

## Rules

### 翻新對應速查表

**封裝元件**：`MsgDisplayer`（`@/components/layout/MsgDisplayer.vue`）

| 原始 JSP 邏輯 | 處理方式 |
|---|---|
| 後端 `ReturnMessage` 序列化為 `msgs[]` | 直接移除（`customAxios` 攔截器統一解析） |
| `alertMessages()` | 直接移除（`MsgDisplayer` 自動處理） |
| `displayMessage()` → bottomFrame `showNotifyMsg` | 直接移除（`MsgDisplayer` 自動處理） |
| `getBottomFrame()` / `getMsgBoard()` | 直接移除 |
| `clearBottomMsg()` / `clearNotifyMsg()` | 直接移除 |
| `txHasRollbackPage` flag | 直接移除 |
| `document.onclick` 清除訊息 | 直接移除（`customAxios` 於請求前自動清除） |

### `MsgDisplayer` defineExpose API

僅在頁面需要手動控制時使用（一般翻新不需關注）：

| 方法 / 屬性 | 說明 |
|---|---|
| `showMessages(msgs)` | 傳入訊息陣列觸發顯示（由 `customAxios` 攔截器呼叫） |
| `clearMessages()` | 清除當前訊息（由 `customAxios` 於請求前呼叫） |
| `notifyMessage` | 底部訊息欄當前訊息（computed ref，供 `BaseLayout.vue` 綁定） |
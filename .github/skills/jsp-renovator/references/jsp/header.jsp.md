# header.jsp 翻新指引

## Core Principles

**REQUIRED**：
- `header.jsp` 已翻新為 `AppHeader`（`@/components/layout/Header.vue`），由 `BaseLayout.vue` 自動 include
- 翻新單一 JSP 時直接移除所有 `header.jsp` 引用，無需任何對應處理

---

## Rules

### 翻新對應速查表

**封裝元件**：`AppHeader`（`@/components/layout/Header.vue`）

| 原始 JSP 邏輯 | 處理方式 |
|---|---|
| `window.charCountsByte` 注入 | 直接移除 |
| `utility.keep_eBAF_parameter(opt)` | 直接移除 |
| `utility.keepResponseTimeEndParameters(uuid)` | 直接移除 |
| `@font-face` EUDC 難字字型 | 直接移除 |
| `frame` 架構的 `watermark_root` | 直接移除 |
| PD_CTRL 資安管控（禁止列印/複製等） | 直接移除（`AppHeader` 自動處理） |
| IS_WATERMARK 浮水印 | 直接移除（`AppHeader` 自動處理） |

### `AppHeader` defineExpose API

僅在頁面需要強制覆寫時使用（一般翻新不需關注）：

| 方法 | 參數 | 說明 |
|---|---|---|
| `applyByFuncId(funcId, userId?)` | `funcId: string` | 依功能代碼自動套用資安管控/浮水印 |
| `enablePdCtrl(funcId)` | `funcId: string` | 僅啟用資安管控 |
| `enableWatermark(userId)` | `userId: string` | 僅啟用浮水印 |
| `disablePdCtrl()` | — | 停用資安管控 |
| `disableWatermark()` | — | 停用浮水印 |
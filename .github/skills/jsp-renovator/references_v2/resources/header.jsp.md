# `jsp_CM/header.jsp` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/header.jsp`
- 目標：頁框初始化、資安行為（禁印/禁複製/禁右鍵/浮水印）
- 對應模組：
  - `src/components/BaseLayout.vue`
  - `src/composables/useSecurityPolicy.js`
  - `src/service/securityLogService.js`
  - `src/stores/uiStateStore.js`

## 黑盒子邊界
- 頁面業務判斷（何時可列印、何時可複製）由頁面自己決策。
- 本文件只處理 header 共用機制遷移，不解讀業務規則。

## Pattern 對照（first match wins）
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `<%@ include file="/html/CM/header.jsp" %>` 且無其他 header API 呼叫 | 移除 include | `DIRECT_REMOVE` | `BaseLayout` 已全局載入，不可保留重複 include |
| 設定全局登入上下文：`eBAF_loginPlatformInfo`, `eBAF_loginSystemInfo`, `eBAF_UserObject_Flag`, `dispatcher` | 寫入 `uiStateStore` 的 auth/security context | `ONE_TO_ONE_REPLACE` | 保留原值，不改 key 意義 |
| 禁印、禁複製、禁右鍵、禁全選等事件攔截 | 以 `useSecurityPolicy` 設定 policy（`disablePrint/disableCopy/disableContextMenu/disableSelectAll`） | `ONE_TO_ONE_REPLACE` | 不再手動綁 `document.on*` |
| 複製行為寫入安全日誌 | 使用 `securityLogService`（由 `useSecurityPolicy` 流程觸發） | `ONE_TO_ONE_REPLACE` | 保留「有複製就記錄」契約 |
| header 內建立浮水印 DOM 或 style | 改為 policy `enableWatermark/watermarkText` | `ONE_TO_ONE_REPLACE` | 不手動插入 DOM |

## 建議改寫骨架
```js
import { useUiStateStore } from '@/stores/uiStateStore.js'

const uiStateStore = useUiStateStore()
uiStateStore.patchSecurityPolicy({
  disablePrint: true,
  disableCopy: true,
  disableContextMenu: true,
  disableSelectAll: true,
  enableWatermark: true,
  watermarkText: 'CONFIDENTIAL'
})
```

## 直接移除清單
- `window.print = function(){...}` 類型覆寫。
- `document.oncontextmenu = ...`、`document.oncopy = ...`、`document.onkeydown = ...` 類型全局綁定。
- 只為防護而插入的 legacy 隱藏欄位或樣式節點。

## Fallback（無法命中既有 pattern）
- 分類：`FALLBACK_STUB`
- 作法：建立頁面級 `applyLegacyHeaderSecurity(config)` 包裝函式，內部只呼叫 `uiStateStore.patchSecurityPolicy`。
- 必須保留：
  - 原 config 的布林旗標意義
  - 原頁面對「開關策略」的控制點

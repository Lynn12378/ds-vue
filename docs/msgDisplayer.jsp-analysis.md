# msgDisplayer.jsp 業務邏輯分析

## 業務邏輯清單

### 後端訊息序列化

- [ ] 從後端 `ReturnMessage` 物件讀取訊息清單並序列化為 JS 陣列 `msgs[]` — JSP 後端邏輯，Vue 翻新後由 `customAxios` 攔截器統一解析 `ErrMsg` 並寫入 Pinia store

### 訊息顯示

- [x] `alertMessages()` — 遍歷 `msgs[]`，`returnCode ≠ 0` 且 `≠ 99` 時組合「訊息說明 + 錯誤編號」字串並以 alert 或 `WIUtil.displayMessage` 彈出
- [x] 有 `displayException` 時顯示「異常原因 + 程式ID」— 例外訊息格式化邏輯
- [x] `returnCode == 99` 時不彈出 alert，僅寫入底部訊息欄 — 靜默訊息邏輯（`msgDisplayer.vue` 以 `returnCode === '99'` 判斷是否靜默）
- [ ] `displayMessage()` → `showNotifyMsg()` — 將第一筆訊息寫入底部 frame 的 `showNotifyMsg` 函式（frame 架構，不遷移；Vue 翻新後改由 Pinia store 的 `notify` 狀態觸發 `MsgDisplayer` 元件顯示）

### 底部 frame 操作

- [ ] `getBottomFrame()` — 透過 `top.frames['leftFrame'].frames['bottomFrame']` 等路徑取得底部 frame 參照（JSP frame 架構，直接移除）
- [ ] `clearBottomMsg()` → `clearNotifyMsg()` — 呼叫底部 frame 的清除訊息函式（frame 架構，直接移除）
- [ ] `getMsgBoard()` — 取得底部 frame 內的 `cathay_common_msgBoard` DOM 元素（frame 架構，直接移除）
- [ ] `txHasRollbackPage` flag 判斷 — 底部 frame 的 rollback 狀態旗標（frame 架構，直接移除）

### 全域事件

- [x] `document.onclick` — 偵測按鈕（`type=button/submit`）點擊後清除底部訊息欄（Vue 翻新後改為在 `customAxios` 發送請求前清除 store 訊息）

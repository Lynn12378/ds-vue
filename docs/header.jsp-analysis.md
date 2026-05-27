# header.jsp 業務邏輯分析

## 業務邏輯清單

### 環境初始化

- [ ] `window.charCountsByte` — 從後端 `ConfigManager.getProperty("ebaf.JSP_CHAR_LENGTH")` 讀取中文字元位元組數設定，注入至全域（需後端 API 提供，Vue 無法直接讀取 Java ConfigManager）
- [ ] `utility.keep_eBAF_parameter(opt)` — 將 `eBAF_loginPlatformInfo` / `eBAF_loginSystemInfo` / `eBAF_UserObject_Flag` / `platformDispatcher` 等登入平台資訊存入 top window（JSP session 參數，Vue 翻新後改由認證 API 或 Pinia store 提供）
- [ ] `utility.keepResponseTimeEndParameters(uuid)` — 頁面 load 後以 `requestTimeHandleUUID` 記錄回應時間終點（需後端回應帶入 UUID，Vue 翻新後改由 `customAxios` 攔截器自動處理）

### 資安管控（PD_CTRL）

- [x] 依功能代碼（`FUNC_ID`）查詢是否啟用資安管控（`PD_CTRL='Y'`）— JSP 後端查詢；Vue 翻新後由後端 API `/header/funcInfo?funcId=XXX` 提供，header.vue 呼叫後根據回應決定是否啟動
- [x] 禁用列印（`Ctrl+P` 攔截 + CSS `@media print` 覆蓋）— 純 JS/CSS 邏輯，100% 等價
- [x] 禁用另存新檔（`Ctrl+S` 攔截）— 純 JS 邏輯，100% 等價
- [x] 禁用全選（`Ctrl+A` 攔截）— 純 JS 邏輯，100% 等價
- [x] 禁用剪下（`Ctrl+X` 攔截 + `cut` 事件攔截）— 純 JS 邏輯，100% 等價
- [x] 禁用右鍵選單（`contextmenu` 事件攔截）— 純 JS 邏輯，100% 等價
- [x] 禁用 `beforeprint` 事件列印— 純 JS 邏輯，100% 等價
- [x] 複製行為記錄（`copy` 事件攔截 + XHR 發送至 `/ZZWeb/servlet/.../ZZM0_0105/ctrlMsavelog`）— JS 邏輯等價；URL endpoint 保留原始路徑，由後端不變

### 浮水印（WaterMark）

- [x] 依功能代碼查詢是否啟用浮水印（`IS_WATERMARK='Y'`）— JSP 後端查詢；Vue 翻新後由後端 API 提供
- [x] 以 `WatermarkPlus` 在頁面顯示使用者姓名 + 時間戳浮水印 — `WatermarkPlus` 是純 JS 函式庫，邏輯 100% 等價
- [x] 浮水印 `mutationObserve: true` + `monitorProtection: true` 防止 DOM 移除 — 純 JS 邏輯，100% 等價
- [x] 浮水印在 mainFrame 時掛載至 top window — Vue SPA 不使用 frame 架構，改為統一掛載至 `document.body`

### 難字字型

- [ ] EUDC 難字字型注入（`@font-face` + CDN URL 判斷）— CSS 字型設定，可直接移至全域 CSS，無需保留在 header.vue（移至 `src/assets/sass/global.scss`）

### 其他

- [ ] `is_same_origin` + `watermark_root` 跨 frame 共用浮水印 — JSP frame 架構依賴，Vue SPA 不使用 frame，直接移除

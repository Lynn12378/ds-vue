# popupWin.js 業務邏輯分析

## 業務邏輯清單

### 視窗開啟與顯示

- [x] `popup(config)` — 開啟彈窗，顯示指定 src URL 的內容（QDialog `v-model` 控制開關；URL 對應改為 Vue Router 子頁面或直接渲染元件）
- [x] `fullPopup(config)` — 以全螢幕模式開啟彈窗（QDialog `maximized` prop）
- [x] `config.title` — 設定彈窗標題（QDialog header slot）
- [x] `config.closeBtn` — 控制是否顯示關閉按鈕（slot 內自訂）
- [x] `config.width` / `config.height` — 設定彈窗寬高（QDialog slot 內容的 CSS 控制）
- [ ] `config.resizable` — 使用者可拖曳調整視窗大小（QDialog 無原生支援，不遷移）
- [ ] `config.movable` — 使用者可拖曳移動視窗位置（QDialog 無原生支援，不遷移）
- [ ] `config.isFullPopup` — 全螢幕彈窗，不含 resize/move 邊框（全螢幕改用 `maximized`）

### 關閉行為

- [x] `popupWin.close()` / `contentWindow.popupWinclose()` — 關閉彈窗（`emit('update:modelValue', false)` 或呼叫 `dialog.hide()`）
- [x] `config.closeConfirm.msg` — 關閉前顯示 confirm 對話框（在 `@hide` 或關閉按鈕事件中自行呼叫 `confirm()`）
- [x] `config.closeConfirm.assignConfirmType` — 控制按下「確定」或「取消」時才真正關閉（close confirm 邏輯封裝至 CustomPopup 內部）
- [x] `config.onClose` / `config.onclose` — 關閉時執行的回呼函數（QDialog `@hide` event）

### 回呼（子頁面 → 父頁面）

- [x] `popupWin.callbackHandler` / `contentWindow.callbackProxy` — 子頁面呼叫父頁面的回呼函數（改為 `window.popupWinBack()` 注入，見子文件）
- [x] `popupWin.back(args...)` / `contentWindow.popupWinBack(args...)` — 子頁面帶參數回呼並關閉彈窗（`window.popupWinBack()` → 父頁面 `@back` event）
- [x] `config.cb` / `config.onBack` — 設定回呼函數（CustomPopup `@back` event handler）

### iframe 子頁面通信機制

- [ ] `setCloseFunc` — 在 iframe load 後將 `close` / `popupWinclose` / `popupWinBack` 注入子頁面的 `contentWindow`（iframe 機制不遷移；Vue 翻新後改為 `window.popupWinBack` 於全域注入，見子文件）
- [ ] `contentWindow.isPopupWin = true` — 子頁面識別自身在 popupWin 中（翻新後改由 Vue Router query 或 prop 傳遞）
- [ ] `callbackFunc(obj1...obj0)` — 接收子頁面最多 10 個回呼參數（翻新後改為 emit 單一 payload 物件）

### DOM 建立工具

- [ ] `createPopupLink(text, config)` — 建立點擊開啟彈窗的 `<a>` 元素（DOM 操作，不遷移；改用 `@click="showPopup"` 綁定）
- [ ] `createPopupButton(text, config)` — 建立點擊開啟彈窗的 `<button>` 元素（DOM 操作，不遷移）
- [ ] `createFullPopupLink(text, config)` — 建立開啟全螢幕彈窗的 `<a>` 元素（DOM 操作，不遷移）
- [ ] `createFullPopupButton(text, config)` — 建立開啟全螢幕彈窗的 `<button>` 元素（DOM 操作，不遷移）

### 視窗開啟（非 popup）

- [ ] `windowOpen(url, opts)` — 以 form POST 方式開啟新瀏覽器視窗（JSP 架構，不遷移；翻新後改用 `router.push` 或直接渲染）

### 拖曳調整

- [ ] `doAdjWindow` / `moveAjdWindow` / `finishAjdWindow` — 滑鼠拖曳調整視窗位置與大小（DOM 操作，QDialog 無原生支援，不遷移）
- [ ] `changeTopScrollHeight` / `rollBackTopScrollHeight` — 調整頁面頂部捲動高度（已廢棄，不遷移）

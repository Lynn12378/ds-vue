# popupWin.js 翻新指引

## Core Principles

**REQUIRED**：
- `popupWin.popup(config)` 一律翻新為 `<CustomPopup v-model="...">` 模式
- `popupWin.fullPopup(config)` 改為 `<CustomPopup v-model="..." :maximized="true">`
- `popupWin.close()` 改為設定 `v-model` 為 `false`，或在 `CustomPopup` 的關閉按鈕事件中處理
- `popupWin.back(args...)` / `window.popupWinBack(payload)` 對應 `@back` event

**FORBIDDEN**：
- 禁止使用 `createPopupLink` / `createPopupButton` / `windowOpen`（DOM 建立工具，全部移除）
- 禁止保留 iframe 機制

---

## Rules

### 翻新對應速查表

**封裝元件**：`CustomPopup`（`@/components/common/custom-popup/CustomPopup.js`）

#### 開啟彈窗

```vue
<!-- JSP: popupWin.popup({ src: url, title: '...', parameters: { KEY: val } }) -->

<!-- Vue -->
<q-btn label="開啟" @click="showPopup = true" />
<CustomPopup
  v-model="showPopup"
  title="彈窗標題"
  @back="onPopupBack"
  @hide="onPopupClose"
>
  <!-- 子元件直接渲染，替代 iframe -->
  <MyChildComponent :params="popupParams" @back="onChildBack" />
</CustomPopup>
```

#### 全螢幕彈窗（對應 `fullPopup`）

```vue
<CustomPopup v-model="showPopup" title="標題" :maximized="true">
  <MyChildComponent />
</CustomPopup>
```

#### props 對應

| 原始 `config` 屬性 | `CustomPopup` prop | 備註 |
|---|---|---|
| `config.title` | `title` | 標題列文字 |
| `config.closeBtn` | `:close-btn="false"` | 預設 `true` |
| `config.closeConfirm.msg` | `:close-confirm="'確認關閉？'"` | 空字串代表不需確認 |
| `config.closeConfirm.assignConfirmType` | `:close-confirm-type="false"` | 預設 `true`（按確定才關閉） |
| `config.isFullPopup` | `:maximized="true"` | — |
| `config.onClose` | `@hide` | 彈窗完全關閉後觸發 |
| `config.cb` / `config.onBack` | `@back` | 子頁面回呼後觸發 |

#### 子頁面回呼（對應 `window.popupWinBack`）

若子頁面（元件）需要帶資料回呼父頁面，見子文件 [popupWin/callback.md](./popupWin/callback.md)

---

### 不可翻新項目

| 原始呼叫 | 處理方式 |
|---|---|
| `popupWin.createPopupLink(text, config)` | 直接移除，改用 `<q-btn @click="showPopup = true">` |
| `popupWin.createPopupButton(text, config)` | 直接移除，改用 `<q-btn @click="showPopup = true">` |
| `popupWin.createFullPopupLink(text, config)` | 直接移除 |
| `popupWin.createFullPopupButton(text, config)` | 直接移除 |
| `popupWin.windowOpen(url, opts)` | JSP form POST 開新視窗，一律 Fallback |
| `config.resizable` | QDialog 無原生拖曳調整，一律 Fallback |
| `config.movable` | QDialog 無原生拖曳移動，一律 Fallback |
| `changeTopScrollHeight` / `rollBackTopScrollHeight` | 已廢棄，直接移除 |

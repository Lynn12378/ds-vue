# PageUI.js 業務邏輯分析

## 業務邏輯清單

### JsUtils — DOM 工具函式庫（全部不遷移）

- [ ] `setEventObserve / stopEventObserving` — 跨瀏覽器事件綁定/解除（原生 `addEventListener`，Vue 以 `@` 指令取代）
- [ ] `getDOM` — 依 id/name 取得 DOM 元素（Vue template ref 取代）
- [ ] `createDOMElement` — 動態建立 DOM 元素（Vue template 取代）
- [ ] `cloneObject` — 深拷貝物件/陣列/DOM（`structuredClone()` 或 `JSON.parse(JSON.stringify(...))` 取代）
- [ ] `isArray / isObject / isString / isFunction / isNumeric / isBasicType` — 型別判斷（原生 JS 或 lodash 取代）
- [ ] `setClass / getClass / compareClass` — DOM class 操作（Vue `:class` binding 取代）
- [ ] `getOffsetTop / getParentByTagName` — DOM 位置/遍歷（CSS/Vue ref 取代）
- [ ] `setCheck / getChecks / getChecksNameByValues / clearChecked` — checkbox/radio 操作（`v-model` 取代）
- [ ] `addSubSelection / addOptions / addChecks` — 動態建立 select/checkbox/radio（Vue `v-for` + `:options` 取代）
- [ ] `getDateInput / setDateInput` — date input 格式化（`CustomDate` 元件取代）
- [ ] `getSelectName / getValue / setValue` — 表單元素取值/設值（`v-model` 取代）
- [ ] `stringToArray / arrayToString / trim / lTrim / rTrim` — 字串工具（原生 JS 取代）

---

### UI_Manager — 全域 UI 事件管理器（全部不遷移）

- [ ] `window.load` 後自動呼叫 `window.init()` — 頁面初始化進入點（Vue `onMounted` 取代）
- [ ] `window.resize` 事件廣播給所有已註冊 UI — DOM resize 機制（Vue SPA 不使用 frame，CSS 自適應取代）
- [ ] `addUIConfig / getUI` — UI 物件全域登錄（Vue provide/inject 取代）

---

### PageUI — 頁面骨架

- [x] `createPage(pageNO, title, subTitleText)` — 建立頁面外框：設定 `document.title`、顯示主標題（功能代碼）、副標題（頁面說明）（`PageUI.vue` 以 `props.title` / `props.subTitle` / `props.pageNo` 渲染）
- [x] `setSubTitle(text)` — 動態更新副標題文字（`PageUI.vue` expose `setSubTitle(text)` 更新 `subTitle` ref）
- [x] `createPage` 的 `noPageFrame` 模式 — 不顯示主標題外框，只渲染內容區（`PageUI.vue` `:no-frame` prop）
- [ ] `createPageWithAllBodySubElement` — 自動收集 body 下所有 DOM 放入內容區（JSP DOM 掃描，不遷移）
- [ ] `loadin(configs, fixedNum)` — 將指定 DOM 搬入內容顯示區（JSP DOM 操作，不遷移；Vue 改用 `<slot>` 渲染）
- [ ] `fixedContent(fixedNum)` — 建立固定欄 sub frame 捲軸區（JSP frame 機制，不遷移）
- [ ] `resize()` — 調整 table/overDiv 高度填滿 viewport（JSP 高度計算，不遷移；CSS `min-height: 100dvh` 取代）
- [ ] `getDocumentHeight / checkDocumentResize` — 取得 iframe 視窗高度（iframe 架構，不遷移）
- [ ] `getBrowser()` — 偵測 IE 版本（IE 不再支援，直接移除）

---

### PageUI — 表單區塊（createContent）

- [x] `createContent(config, loadinValues, showType)` — 建立表單區塊：依 `config.contents` 定義產生 header + 欄位排版（`PageUI.vue` 以 `<slot>` 讓頁面自行渲染 Quasar 表單元件）
- [x] `showType: 0` — 輸入模式（`PageUI.vue` 以 `:mode="'input'"` prop 控制）
- [x] `showType: 1` — 顯示模式（`PageUI.vue` 以 `:mode="'display'"` prop 控制）
- [x] `setContentsDisplay(content, displayType)` — 切換整區塊輸入/顯示模式（`PageUI.vue` expose `setMode(mode)` 更新 `mode` ref，由頁面 `:mode` binding 響應）
- [x] `setContentDisplay(node, displayType)` — 切換單一欄位輸入/顯示模式（頁面自行以 `v-show` 或 `:disable` 控制）
- [ ] `createInput(type, id, setting)` — 動態建立各型態 input DOM（DOM 操作，不遷移；各型態改用對應 Quasar 元件）
- [ ] `config.dataColumns` — 每列顯示欄數（JSP table 佈局，Vue 改用 QLayout grid 或 Tailwind grid）
- [ ] `config.headerInTop` — header 置頂佈局（Vue slot 自行排版）
- [ ] `config.columnProps` — 各欄寬度比例（CSS flex/grid 取代）

---

### PageUI — 表單值操作

- [x] `getContentValues(content)` — 取得整區塊所有欄位值（翻新後直接讀取 `reactive` 表單物件，無需特別遷移）
- [x] `setContentValues(content, values)` — 批次寫入欄位值（直接 `Object.assign(form, values)` 取代）
- [x] `commitContentValues(content)` — 將輸入值同步至顯示區（`v-model` 雙向綁定自動處理，無需遷移）
- [x] `rollbackContentValues(content)` — 放棄輸入值，回復為顯示值（頁面自行保存舊值 ref 並還原）
- [ ] `getContentValue(node)` / `setContentValue(node, value)` — 依 DOM 節點單一欄位讀寫（DOM 操作，直接讀寫 reactive 物件取代）

---

### PageUI — 按鈕列

- [x] `createButtonArea(content, buttonConfig)` — 建立按鈕列（頁面自行以 `q-btn` 排版，不需封裝）
- [x] `setButtonsEnable(buttonContent, enableArray)` — 依清單控制按鈕 enable/disable（頁面自行以 `:disable` binding 控制各按鈕）

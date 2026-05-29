# PageUI.js 翻新計畫

## 業務功能清單

PageUI.js 包含三個類別：

### JsUtils — DOM 工具集
1. **事件綁定/移除** — `setEventObserve()`、`stopEventObserving()`，跨瀏覽器事件管理
2. **DOM 取得與操作** — `getDOM()`、`createDOMElement()`、`removeAllChildren()`、`cloneObject()`
3. **型態判斷** — `isArray()`、`isObject()`、`isString()`、`isNumeric()`、`isFunction()`、`isDOMObject()` 等
4. **class 操作** — `setClass()`、`getClass()`、`compareClass()`
5. **Select 操作** — `addOptions()`、`setOption()`、`removeOptions()`、`getSelectName()`
6. **Checkbox/Radio 操作** — `addChecks()`、`setCheck()`、`getChecks()`、`getChecksNameByValues()`、`clearChecked()`
7. **字串處理** — `trim()`、`lTrim()`、`rTrim()`、`stringToArray()`、`arrayToString()`
8. **日期 input 操作** — `setDateInput()`、`getDateInput()`、`getSimpleDateFormat()`
9. **位置計算** — `getOffsetTop()`、`getParentByTagName()`

### UI_Manager — UI 生命週期管理
10. **UI 元件註冊** — `addUIConfig()`、`getUI()`，管理所有 UI 元件的生命週期
11. **視窗事件廣播** — `callShareingObserve()`，window resize 時廣播至所有已註冊 UI
12. **頁面初始化** — window load 時呼叫 `window.init()`

### PageUI — 頁面版面產生器
13. **頁面外框產生** — `createPage(pageNO, title, subTitleText)`，動態建立標題列、邊框、內容區
14. **區塊載入** — `loadin(configs, fixedNum)`，將指定 DOM 納入版面內容區
15. **固定區塊** — `fixedContent(fixedNum)`，實作捲動子區塊（overDiv）機制
16. **視窗 resize** — `resize()`，依視窗高度動態調整版面高度
17. **表單區塊產生** — `createContent(config)`，依 config 動態產生輸入/顯示兩態的欄位表格，支援 text / number / money / select / date / datebetween / textarea / radio / checkbox / dom / link 等類型
18. **欄位值存取** — `getContentValues()`、`setContentValues()`，批次讀寫 content 內所有欄位值
19. **顯示/輸入模式切換** — `setContentsDisplay(content, displayType)`，切換整個 content 的 input/display 模式
20. **單欄位 commit/rollback** — `commitContentValue()`、`rollbackContentValue()`，單欄位顯示區更新與回復
21. **按鈕區塊產生** — `createButtonArea(content, buttonConfig)`，動態產生按鈕列
22. **按鈕啟用控制** — `setButtonsEnable(buttonContent, enableArray)`，批次啟用/停用按鈕
23. **副標題更新** — `setSubTitle(text)`

---

## Store 資料型態

> 暫以 `ref()` / `reactive()` 實作，待 Store 架構確認後遷移

| 欄位 | 型態 | 來源 | 說明 |
|---|---|---|---|
| `pageTitle` | `string` | `createPage()` 參數 | 頁面主標題 |
| `pageSubTitle` | `string` | `createPage()` 參數 | 頁面副標題，可動態更新 |
| `pageNo` | `string` | `createPage()` 參數 | 頁面編號 |
| `displayMode` | `'input' \| 'display'` | `setContentsDisplay()` | 整頁欄位顯示/輸入模式 |

---

## 翻新計畫

### 建議建立的檔案

#### `src/components/layout/CustomPage.vue`
處理功能：**13、16、23**
- 接收 `title`、`subTitle`、`pageNo`、`noFrame` props
- 替代 `PageUI.createPage()` 的版面結構（標題列 + 邊框 + 內容區 `<slot>`）
- `setSubTitle()` → `defineExpose`

#### `src/components/layout/CustomPageContent.vue`
處理功能：**17、18、19、20**
- 替代 `PageUI.createContent()` 的欄位表格結構
- 所有欄位類型改為 Quasar 元件（`q-input`、`q-select`、`q-radio`、`q-checkbox` 等）
- `displayMode` prop 控制 input/display 模式切換（`:readonly`、`v-show`）
- 欄位值改由 `v-model` / `ref()` 直接管理，不需 `getContentValues` / `setContentValues`

#### `src/components/layout/CustomButtonArea.vue`（或直接用 `q-btn`）
處理功能：**21、22**
- `createButtonArea()` → 直接在頁面 template 使用 `q-btn`，`:disable` binding 取代 `setButtonsEnable()`

### JsUtils 處理

| 功能類型 | 處理方式 |
|---|---|
| 事件綁定/移除 | 直接移除，改用 Vue 原生事件 |
| DOM 取得與操作 | 直接移除，改用 `ref` / Vue template |
| 型態判斷 | 直接移除，改用原生 `Array.isArray()` 等 |
| class 操作 | 直接移除，改用 `:class` binding |
| Select 操作 | 直接移除，改用 `q-select` + `options` prop |
| Checkbox/Radio 操作 | 直接移除，改用 `q-checkbox` / `q-radio` + `v-model` |
| 字串處理 | 直接移除，改用原生 `String.trim()` 等 |
| 日期 input 操作 | 直接移除，改用 `CustomDate` 元件 |

### UI_Manager 處理

| 功能 | 處理方式 |
|---|---|
| UI 元件生命週期管理 | 直接移除，Vue 元件生命週期自動管理 |
| window resize 廣播 | 直接移除，改用 CSS `min-height: 100dvh` |
| `window.init()` 呼叫 | 直接移除，改用 `onMounted` |

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 15（固定區塊 overDiv） | 捲動子區塊機制是否在新架構中仍需保留？建議改用 CSS `overflow-y: auto` + `max-height` |
| 功能 17（createContent displayMode） | input/display 兩態切換是否仍為業務需求？若是，`CustomPageContent` 需支援 `:mode` prop |
| 功能 20（rollback） | 欄位回復機制是否仍需保留？若是，頁面自行儲存舊值後以 `Object.assign` 還原 |

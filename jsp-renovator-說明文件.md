# jsp-renovator

**JSP 翻新工具**，將單頁 Legacy JSP 翻新為等價的 Vue 3 SFC。依專案技術棧規範執行逐行替換，後端注入資料以 `doPrompt` 補償，無法翻新項目標記 TODO，無文件對應之自訂資源一律 Fallback composable。

---

## 功能重點

1. **業務邏輯完整還原**：JSP 內部可見的版面結構與業務規格必須完整對應至 Vue SFC，所有重構點標記 FIXME，無法翻新項目標記 TODO，不得跳過。
2. **分層翻新決策**：翻新流程分兩軌執行 — R1（語義已知技術棧直接替換）與 R2（需依規範文件決策的項目），執行前必須先輸出分析報告，Step 2 ~ Step 4 須嚴格依報告執行。
3. **自訂資源 Fallback 機制**：自訂資源（`CSRUtil.*`、`PageUI.*`、`popupWin.*`、`TableUI.*`、`date.js` 等）若有對應規範文件則依文件翻新；無文件則統一於 `<script setup>` 最底部建立 Fallback composable，禁止推論實作邏輯。
4. **Server-side 資料補償**：後端注入語法（EL 表達式 `${xxx}`、Scriptlet 輸出 `<%=xxx%>` 等）統一於 `onMounted` 呼叫 `doPrompt` 補償，補償變數 key 對應原始資料名稱，並標注 `// FIXME: 資料來源待確認`。
5. **表單驗證技術棧遷移**：引用 `CM/js/ui/validation.js` 的頁面，將驗證規則依 CSS class → Yup 對照表翻新為 VeeValidate + Yup + Quasar，自訂規則抽為頁面內箭頭函式並以 `.test()` 引用。

---

## 使用方式

在 Copilot Chat 中輸入以下指令執行：

```bash
/jsp-renovator jsp=<JSP 檔案路徑>
```

- `jsp`：必填，目標 JSP 檔案路徑。
  - 例如 `src/main/webapp/html/DS/A3/DSA30900.jsp`。

工具執行為五步驟流程（Step 1 → Step 5），每步驟完成後自動接續下一步。

---

## 執行流程

### Step 1：分析與決策
掃描 JSP，識別所有 R2 項目（UI 元件替換、表單驗證、Server-side 資料、自訂資源），確認翻新邊界，依模板輸出分析報告。

- 模板：`.github/skills/jsp-renovator/templates/analysis-report-template.md`
- 產出：`.github/ir/analysis/{FileName}-analysis.md`

分析報告包含兩張核心表格：

| 表格 | 用途 |
|---|---|
| **表一：R2 翻新決策表** | 列出所有 R2 項目與翻新依據，Step 4 嚴格依此執行 |
| **表二：Fallback 清單** | 列出無對應文件的自訂資源，Step 2 依此建立 composable |

### Step 2：建立 Fallback Composables
依表二，於 `<script setup>` 最底部統一建立 Fallback composable，以 `// region` + `// endregion` 包裹，方法名稱對應原始資源方法名稱。

### Step 3：R1 直接翻新
依 R1 規範逐行翻新語義已知項目（Prototype.js、jQuery、JSTL core、廢棄 HTML 屬性、原生 AJAX 等）。

### Step 4：R2 規範翻新
依表一與對應規範文件逐項翻新，**僅處理表一列出的項目，不得自行新增**。

### Step 5：驗證
對照 Evaluation Checklist 逐項確認。發現語法錯誤時，先查規範文件是否有處理方式；有規範則依規範修正，無規範則標記 TODO，**禁止自行推論修正**。

---

## 產出結果

執行後產出以下檔案：

- **分析報告**：`.github/ir/analysis/{FileName}-analysis.md`
- **Vue SFC**：`src/views/{Module}/{FileName}.vue`
- **路由更新**：`src/router/index.js`

`{FileName}` = `systemCode(2) + moduleCode(2) + subCode(4)`，例：`DSA30900`。  
`{Module}` = `moduleCode(2)`，例：`A3`。

---

## 規範文件索引

各翻新類別的對應規範文件位於 `.github/instructions/`：

| 翻新類別 | 規範文件 | 說明 |
|---|---|---|
| Quasar UI 元件替換 | `quasar-components.instructions.md` | `<table>`, `<input>`, `<select>`, `<textarea>` → Quasar 元件 |
| 表單驗證 | `form-validation.instructions.md` | `validation.js` → VeeValidate + Yup + Quasar |
| Server-side 資料補償 | `server-side.instructions.md` | EL 表達式與 Scriptlet 輸出 → `doPrompt` |
| CSRUtil | `jsp/csrUtil.instructions.md` | `CSRUtil.*` → `useCommon()` / `format.js` / Day.js |
| PageUI | `jsp/pageUI.instructions.md` | `PageUI.*` → `usePageUIAdapter` + `PageUILayout` |
| TableUI | `jsp/tableUI.instructions.md` | `new TableUI(config)` → `<TableUI ref>` + Ref API |
| popupWin | `jsp/popupWin.instructions.md` | `popupWin.*` → `usePopupWinAdapter` + `PopupWinDialog` |
| 日期選擇器 | `jsp/calendar.instructions.md` | `getCalendarFor` + `calendar.gif` → `q-input` + `q-popup-proxy` + `q-date` |
| 日期工具 | `jsp/date.instructions.md` | `date.js` API → `useCommon()` + Day.js |
| 其他自訂資源 | `jsp/{resourceName}.instructions.md` | 無對應文件則 Fallback |

---

## Fallback 模式說明

無對應規範文件的自訂資源，統一依下列模式建立 composable，**禁止實作內部邏輯**：

```js
const use{ResourceName} = () => {
  // 若可觀察到包裹子元素：透傳 slot
  template: '<slot />'
  // 無傳入值
  const methodName = () => void
  // 函式型（有傳入值）：傳入值直接回傳
  const methodName = (arg) => arg ?? null
  return { methodName }
}
```

---

## 相關說明文件

以下為各規範文件的功能說明，供理解整體架構使用：

### `quasar-components.instructions.md`
**Quasar 元件轉換規範**，定義原生 HTML 表單元素與 Quasar 元件的 1:1 對應關係。所有元件統一套用 `dense outlined/bordered` 樣式；radio/checkbox 群組必須以 `<q-field>` 包裹以確保錯誤訊息正確顯示；日期輸入欄位轉換為 `<q-input>` + `<q-popup-proxy>` + `<q-date>` 組合。

### `form-validation.instructions.md`
**表單驗證翻新規範**，定義 `validation.js` CSS class 到 Yup 規則的完整對照表（含 `required`、`validate-ROCDate`、`validate-Date-Interval` 等共 30+ 條規則）。所有 form 欄位必須以 `useField` 宣告，`useForm` 必須設定 `initialValues` 與 `validateOnMount: false`；跨欄驗證改寫為 `.test()` 透過 `this.parent` 存取關聯欄位；自訂規則（`add` / `addAllThese`）抽為頁面內箭頭函式。

### `server-side.instructions.md`
**Server-side 資料補償規範**，定義後端注入語法的補償策略。所有 EL 表達式與 Scriptlet 輸出統一於 `onMounted` 呼叫 `doPrompt`（`customAxios.get('{Bean_Name}/prompt')`）取得，補償變數 key 對應原始資料名稱，並標注 `// FIXME: 資料來源待確認`。`${param.xxx}` 為例外，直接翻新為 `route.query.xxx`。

### `csrUtil.instructions.md`
**CSRUtil 遷移對照**，定義 `CSRUtil.*` API 到新專案共用方法的完整映射。`checkROCID` / `checkROCARC` / `checkUniSN` → `useCommon()`；日期轉換 → `useCommon().tranCEorROCDate()`；日期運算 → Day.js；數值格式化 → `format.js`。無對應 API（`exportXls` 等）標記 TODO，禁止新增共用方法。

### `pageUI.instructions.md`
**PageUI 語法轉換規範**，定義 `PageUI.*` API 到 `usePageUIAdapter` composable 的完整 1:1 對應。頁面骨架由 DOM 動態建構改為在 template 掛載 `<PageUILayout>`；`contentDiv` 子區塊注入改為 `blocks` + `<component :is>` 機制。直接 DOM 操作、IE 專用版面邏輯等無法還原的功能直接移除，不需額外註解。

### `tableUI.instructions.md`
**TableUI 遷移對照**，定義 `new TableUI(config)` 到 `<TableUI ref>` 元件的完整轉換。`config` 屬性（`pageSize`、`allSortable`、`autoCheckBox`、`column.header` 等）對應至元件 props 與 `columns` 定義；`grid.load()` / `grid.reload()` 等方法改為透過 `tableRef.value.xxx()` 呼叫；欄位內嵌 input 改用 `<template #body-cell-xxx>` 自訂儲存格模板。

### `popupWin.instructions.md`
**popupWin 語法轉換規範**，定義 `popupWin.*` API 到 `usePopupWinAdapter` composable 的完整 1:1 對應。Popup 視覺容器改為在 template 掛載 `<PopupWinDialog>`；iframe 內頁回呼改為 `window.popupWinBack()` / `window.popupWinclose()`。拖曳縮放與 Prototype 事件橋接等無法還原的功能直接移除，不需額外註解。

### `calendar.instructions.md`
**日期選擇器語法轉換規範**，定義 `getCalendarFor()` + `calendar.gif` 組合到 `<q-input>` + `<q-popup-proxy>` + `<q-date>` 的轉換。ROC 日期欄位必須透過 `useCommon().tranCEorROCDate()` 做 CE/ROC 互轉；`mask` 只控制 UI 顯示格式，送出 API 前必須另行格式轉換；`autoCreateDate()` 不轉 API，改為元件化日期欄位。

### `date.instructions.md`
**日期工具語法轉換規範**，定義 `date.js` API 到 `useCommon()` 與 Day.js 的完整映射。ROC/西元互轉 → `useCommon().tranCEorROCDate()`；日期差值 → `dayjs().diff()`；日期加減 → `dayjs().add()`；時間戳記 → `dayjs().format()`。`isHoliday()` / `getDutyDay()` 無對應 API，標記 TODO 待人工處理。

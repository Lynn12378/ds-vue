# TableUI.js 業務邏輯分析

## 業務邏輯清單

### 初始化

- [x] `config.table` — 指定綁定的 DOM table 元素（`CustomTable` 直接以 Vue 元件取代 DOM 操作）
- [x] `config.column` — 欄位定義陣列（`columns` prop）
- [x] `config.headerColumn` — 獨立 header 欄位定義（多列 header 另以 `headerRows` prop 傳入）
- [x] `config.split` — 多列 header 的欄位分行設定（`headerRows` prop 取代）
- [x] `config.pageSize` — 每頁筆數（`:pagination="{ rowsPerPage: N }"`；0 = 不分頁）
- [x] `config.title` — 表格標題文字（`QTable` `:title` prop）
- [x] `config.needHeader` — 是否顯示 header 列（`QTable` `hide-header` prop）
- [x] `config.allSortable` — 全域預設所有欄位可排序（各欄位明確設定 `sortable: true/false`）
- [x] `config.rowClick` — 列點擊事件（`@row-click`）
- [x] `config.setRecordBackground` — 依函式設定資料列背景色（`QTable` `:table-row-class-fn` 或 `body-cell` slot）
- [x] `config.setRecordClass` — 依函式設定資料列 CSS class（`QTable` `:table-row-class-fn`）
- [x] `config.whenDataNull` — 全域空值替代顯示（各欄位 `format: (val) => val ?? '替代文字'`）
- [x] `config.autoCheckBox` — 自動勾選欄（`selection="multiple/single"` + `v-model:selected`）
- [x] `config.autoCheckBox.type: 'radio'` — 單選模式（`selection="single"`）
- [x] `config.autoCheckBox.checkRule` — 初始勾選條件函式（`rows.value` 載入後自行 filter 設定 selected）
- [x] `config.autoCheckBox.disableRule` — 停用勾選條件（`body-selection` slot 中依 row 資料控制 disable）
- [x] `config.autoCheckBox.highlight` — 勾選後整列 highlight（`:table-row-class-fn` 依 selected 狀態加 class）
- [ ] `config.isLoadByFatch` — 後端動態分頁（每頁翻頁時發 Ajax 取資料；`QTable` `@request` event，由頁面自行實作）
- [ ] `config.printMode` — 列印模式（直接移除）
- [ ] `config.overDiv` / `config.overDiv.maxHeight` — 固定高度 + 捲軸（`style="max-height: Npx"` + `virtual-scroll`；`false` 直接移除）
- [ ] `config.fixedColumns` — 固定左側欄（JSP DOM 雙 table 實作；不遷移，另以 CSS sticky 手動實作）
- [ ] `config.hiddenColumns` — 可隱藏欄（`QTable` `visibleColumns` prop）
- [ ] `config.allRenderInCount` — 全域合計列渲染設定（`bottom-row` slot 自行處理）
- [ ] `config.recordInfoPattern` — 分頁資訊文字格式（`QTable` `pagination-label` prop）
- [ ] `config.pageInfo` — 是否顯示分頁資訊（`QTable` `hide-pagination` prop）
- [ ] `config.beforeLoad` / `config.afterLoad` — 載入前後 callback（axios 請求前後自行處理）
- [ ] `config.pageChange` / `config.beforePageChange` — 換頁 callback（`@update:pagination`）
- [ ] `config.validateRecord` — 載入時自動驗證函式（由頁面在 `rows.value =` 後自行遍歷驗證）
- [ ] `config.validateRecordCheckedOnly` — 只驗證已勾選列（由頁面自行過濾）

### 欄位定義（`column[]`）

- [x] `column.key` — 欄位識別鍵（`name` + `field`）
- [x] `column.header` — 欄位標題（`label`）
- [x] `column.sortable` — 是否可排序（`sortable: true/false`）
- [x] `column.sortRule` — 排序類型（`string`/`number`/`date`/`rocdate`）（QTable `sort` function）
- [x] `column.sortKey` — 排序使用的資料 key（不同於顯示 key 時，`sort` function 自行取值）
- [x] `column.dataType: 'number'` — 千分位數字格式（`format: (val) => Number(val).toLocaleString()`）
- [x] `column.dataType: 'date'` — 西元日期格式（`format`，見翻新指引 R-col）
- [x] `column.dataType: 'rocdate'` — 民國日期格式（`format`，見翻新指引 R-col）
- [x] `column.format` — 自訂格式化函式（直接對應 `columns[].format`）
- [x] `column.render` — 自訂渲染（純文字 → `format`；含元件 → `body-cell-{name}` slot）
- [x] `column.staticWidth` / `column.width` — 固定欄寬（`style: 'width: Npx'`）
- [x] `column.attrs.align` — 水平對齊（`align: 'left'/'center'/'right'`）
- [x] `column.classes` / `column.className` — 欄位 CSS class（`classes`）
- [x] `column.styles` — 欄位 CSS style（`style`）
- [x] `column.whenDataNull` — 單欄空值替代（`format: (val) => val ?? '替代文字'`）
- [x] `column.defaultValue` — 欄位預設值（頁面初始化 `rows.value` 資料時自行設定）
- [x] `column.input` — 可編輯欄位（`body-cell-{name}` slot 嵌入 Quasar 元件，見翻新指引 R-input）
- [ ] `column.groupKey` — 列合併（本次不實作，影響排序）
- [ ] `column.empty: 'rowSpan_up'/'rowSpan_down'` — Header 自動 rowSpan 計算（`headerRows` 手動指定）
- [ ] `column.renderInCount` — 合計列渲染（`bottom-row` slot 自行處理）
- [ ] `column.ignoreGroup` — 排除列合併（不實作）
- [ ] `column.colGroup` — 欄位群組（JSP DOM 架構，不遷移）
- [ ] `column.fixedColumn` — 單欄固定（同 `config.fixedColumns`，不遷移）
- [ ] `column.hiddenColumn` — 單欄隱藏（`visibleColumns` prop）
- [ ] `column.input.type: 'text'` — 文字輸入欄（`body-cell-{name}` → `q-input`）
- [ ] `column.input.type: 'select'` — 下拉選單欄（`body-cell-{name}` → `q-select`）
- [ ] `column.input.type: 'checkbox'` — 勾選欄（`body-cell-{name}` → `q-checkbox`）
- [ ] `column.input.type: 'radio'` — 單選欄（`body-cell-{name}` → `q-radio`）
- [ ] `column.input.type: 'button'` — 按鈕欄（`body-cell-{name}` → `q-btn`）
- [ ] `column.input.type: 'show'` — 展開/收折文字欄（`body-cell-{name}` 自行實作）

### 排序（`sort`）

- [x] 字串排序（`sortByStringIncrease/Decrease`）（QTable 預設字串排序）
- [x] 數字排序（`sortByNumericIncrease/Decrease`）（QTable `sort: (a, b) => Number(a) - Number(b)`）
- [x] 日期排序（`sortByDateIncrease/Decrease`）（QTable `sort`，見翻新指引 R-sort）
- [x] 民國日期排序（`rocdate`，轉西元後排序）（QTable `sort`，見翻新指引 R-sort）
- [x] `tableUI.sort(key, isIncrease)` — 程式觸發排序（更新 `pagination.value` 的 `sortBy`/`descending`）
- [ ] 列合併跨鍵排序（`sortGroupKeys`）（不實作）

### 資料操作（命令式方法）

- [x] `tableUI.loadin(records)` — 載入資料（`rows.value = records`）
- [x] `tableUI.reload()` / `tableUI.loadAgain()` — 重新查詢（重新呼叫查詢函式）
- [x] `tableUI.clear()` — 清空資料（`rows.value = []`）
- [x] `tableUI.getAllRecords()` — 取得全部資料（直接讀取 `rows.value`）
- [x] `tableUI.getCurrentPageRecords()` — 取得當頁資料（本地分頁：slice；後端分頁：直接讀 `rows.value`）
- [x] `tableUI.getCheckedRecords()` — 取得已勾選資料（直接讀取 `selected.value`）
- [x] `tableUI.getUncheckedRecords()` — 取得未勾選資料（`rows.value.filter(r => !selected.value.includes(r))`）
- [x] `tableUI.addRecords(records)` — 新增資料列（`rows.value = [...rows.value, ...records]`）
- [x] `tableUI.deleteRecords(records)` — 刪除資料列（`rows.value = rows.value.filter(r => !records.includes(r))`）
- [x] `tableUI.hasRecords()` — 是否有資料（`rows.value.length > 0`）
- [x] `tableUI.getDeletedRecords()` — 取得已刪除資料（頁面自行維護 `deletedRows` ref）
- [x] `tableUI.show()` / `tableUI.hide()` — 顯示/隱藏表格（`v-show` 綁定 ref）
- [x] `tableUI.getRecordsBySerialNo(idx)` — 依序號取得資料（`rows.value[idx - 1]`）
- [ ] `tableUI.getRecordsByCell(cell)` / `tableUI.getRecordByCell(cell)` — 依 TD DOM 元素取得資料（DOM 操作，不遷移；slot scope 的 `row` 直接存取）
- [ ] `tableUI.getSerialNumber(cell)` / `tableUI.getSerialNumbers(cell)` — 取得列序號（slot scope 的 `rowIndex`）
- [ ] `tableUI.getDeletedRecords()` — 取得已刪除資料（頁面自行維護 `deletedRows` ref）

### 驗證（validate）

- [ ] `tableUI.validTable()` — 整表驗證，回傳錯誤筆數（遍歷 `rows.value` 依 validateRecord 執行，標記 `row._error`）
- [ ] `tableUI.validCheckedOnTable()` — 僅驗證已勾選列（`selected.value` 範圍驗證）
- [ ] `tableUI.setValidRecord(node, isValid)` — 設定單列驗證結果（直接設定 `row._error = !isValid`）
- [ ] `tableUI.setValidRecordByRecord(records, isValid)` — 批次設定驗證結果（遍歷設定 `row._error`）
- [ ] `tableUI.resetValidate()` — 重置所有驗證狀態（`rows.value.forEach(r => delete r._error)`）
- [ ] `tableUI.getErrorRecords()` — 取得驗證錯誤列（`rows.value.filter(r => r._error === true)`）
- [ ] `tableUI.getCorrectRecords()` — 取得驗證正確列（`rows.value.filter(r => r._error !== true)`）
- [ ] `tableUI.getCheckedErrorRecords()` — 取得已勾選且驗證錯誤列（交集過濾）
- [ ] `tableUI.getCheckedCorrectRecords()` — 取得已勾選且驗證正確列（交集過濾）

### 合計列（totalCount）

- [ ] `tableUI.resetTotalCount(data)` — 設定底部合計列資料（`bottom-row` slot 自行渲染）
- [ ] `tableUI.resetSubTotalCount(data)` — 設定小計資料（`bottom-row` slot 自行渲染）
- [ ] `tableUI.getTotalCount()` — 取得合計資料（頁面自行維護 `totalCount` ref）
- [ ] `tableUI.getSubTotalCount()` — 取得小計資料（頁面自行維護 `subTotalCount` ref）

### XLS 匯出

- [x] `tableUI.exportAllToXLS(fileName)` — 匯出全部資料（`exportToXls(fileName, columns, rows.value)`）
- [x] `tableUI.exportCheckToXLS(fileName)` — 匯出已勾選資料（`exportToXls(fileName, columns, selected.value)`）
- [ ] `tableUI.exportToXLS(fileName, records)` — 匯出指定資料（`exportToXls(fileName, columns, records)`）
- [ ] `TableUIsExportToXLS` / `ExportXLSWithJSON` — 全域函式（不遷移，`exportToXls` 取代）

### 表格狀態（tableInfo）

- [ ] `tableUI.getTableInfo()` — 取得當前分頁/排序/欄位狀態（頁面自行用 `pagination.value` 等 ref 記錄）
- [ ] `tableUI.setTableInfo(info)` — 還原表格狀態（頁面自行還原 `pagination.value`）

### UI 控制

- [ ] `tableUI.resize()` / `tableUI.resetDiv()` — 調整表格容器高度（CSS 自動控制，不遷移）
- [ ] `tableUI.scrollTop()` / `tableUI.scrollBottom()` — 捲動至頂/底（`tableRef.value.$el.scrollTop`）
- [ ] `sizeController` — 整體尺寸管理（JSP DOM 高度計算，不遷移）
- [ ] `fixedDataArea` / `displayDataArea` 雙 table DOM 架構 — 固定欄位的 JSP 實作（不遷移）
- [ ] CSS 動態注入（`TableUI.css`）— 不遷移，Quasar 樣式取代

### 後端動態分頁（`pageControlFatch_impl`）

- [ ] `loadin(url, rules)` — 以 URL + 查詢條件啟動後端分頁（`QTable` `@request` event，由頁面實作）
- [ ] `loadAgain()` — 以相同條件重新查詢後端（重新觸發 `@request`）
- [ ] 前後頁 prefetch 快取（`pervious_records` / `next_records`）— 不遷移

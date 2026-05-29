# TableUI.js 翻新指引

## Core Principles

**REQUIRED**：
- `new TableUI(config)` 一律翻新為 `<CustomTable>` 元件（`@/components/common/custom-table/CustomTable.js`）
- `CustomTable` 以 `rows`、`columns` props 驅動資料，預設已套用 `flat`、`bordered`、`dense`
- 所有命令式操作（`tableUI.loadin()`、`tableUI.getAllRecords()` 等）一律改為直接操作 Vue `ref`
- 禁止直接使用 `q-table`，一律透過 `CustomTable` 封裝

**FORBIDDEN**：
- 列合併（`groupKey`）不實作，避免影響排序
- 固定欄位（`fixedColumns`）不封裝進 `CustomTable`，由頁面自行以 CSS `position: sticky` 處理

---

## Rules

### R1：`new TableUI(config)` → `<CustomTable>` props

| 原始 config | 翻新方式 |
|---|---|
| `table` | 以 `<CustomTable>` 替換對應位置的 `<table>` |
| `column` | 翻新為 `columns` prop，見 R-col |
| `headerColumn` / `split` | **不遷移**（多列 header 造成版面跑版，直接移除） |
| `pageSize` | `:pagination="{ rowsPerPage: N }"`（0 = 顯示全部） |
| `title` | `:title="'標題文字'"` |
| `needHeader: false` | `hide-header` |
| `allSortable: false` | 各欄位明確設定 `sortable: false` |
| `rowClick` | `@row-click="onRowClick"` |
| `setRecordClass` | `:table-row-class-fn="fn"` |
| `setRecordBackground` | `:table-row-style-fn="fn"` |
| `whenDataNull` | 各欄位加 `format: (val) => val ?? '替代文字'` |
| `autoCheckBox` | `selection="multiple"` + `v-model:selected`，見 R-sel |
| `autoCheckBox.type: 'radio'` | `selection="single"` + `v-model:selected` |
| `overDiv.maxHeight: N` | `style="max-height: Npx"` + `virtual-scroll` |
| `overDiv: false` | 直接移除（`CustomTable` 預設無高度限制） |
| `fixedColumns` | 直接移除（頁面自行加 CSS `position: sticky`） |
| `isLoadByFatch` | 見 R-server |
| `pageChange` | `@update:pagination` |
| `beforeLoad` / `afterLoad` | 在 axios 請求前後自行處理 |
| `printMode` | 直接移除 |

---

### R-col：`column[]` 欄位定義

| 原始 column 參數 | 翻新 columns[] 參數 |
|---|---|
| `key` | `name`（識別）+ `field`（取值 key 或函式） |
| `header` | `label` |
| `sortable` | `sortable: true/false` |
| `sortRule` / `sortKey` | 見 R-sort |
| `dataType: 'number'` | `format: (val) => val != null ? Number(val).toLocaleString() : ''` |
| `dataType: 'date'` | `format: (val) => val ? dayjs(val).format('YYYY-MM-DD') : ''`（見 `date.js` 翻新指引 `SimpleDateFormat`） |
| `dataType: 'rocdate'` | `format: (val) => val ? toROC(val) : ''`（`toROC` 來自 `@/assets/utils/date.js`，見 `date.js` 翻新指引） |
| `format` | 直接對應 `format: (val, row) => ...` |
| `render`（純文字） | `format: (val, row) => ...` |
| `render`（含元件） | `body-cell-{name}` slot |
| `input` | `body-cell-{name}` slot，見 R-input |
| `staticWidth` / `width` | `style: 'width: Npx'` |
| `attrs.align` | `align: 'left'/'center'/'right'` |
| `classes` / `className` | `classes: 'class-name'` |
| `styles` | `style: 'css: value'` |
| `whenDataNull` | `format: (val) => val ?? '替代文字'` |
| `hiddenColumn` | 不在 `visibleColumns` 清單內即隱藏 |
| `groupKey` | **不遷移**（影響排序） |
| `fixedColumn` | **不遷移**（頁面自行 CSS sticky） |

---

### R-header：多列 Header（`headerColumn` / `split`）

**不遷移**。多列 header 會覆蓋 QTable 預設的 `#header` slot 渲染，造成版面跑版。

翻新時直接忽略 `config.headerColumn` 與 `config.split`，`<CustomTable>` 不傳入 `:header-rows`，使用 QTable 預設單行 header。

---

### R-sort：排序（`sortRule`）

| 原始 `sortRule` | 翻新 `sort` function |
|---|---|
| `'string'`（預設） | 不設定（QTable 預設字串排序） |
| `'number'` | `sort: (a, b) => Number(String(a).replace(/,/g,'')) - Number(String(b).replace(/,/g,''))` |
| `'date'` | `sort: (a, b) => new Date(a) - new Date(b)` |
| `'rocdate'` | `sort: (a, b) => new Date(toY2K(a)) - new Date(toY2K(b))`（`toY2K` 來自 `@/assets/utils/date.js`） |

sortKey（排序 key 與顯示 key 不同）：

```js
{
  name: 'AMT_DISPLAY',
  field: row => row.AMT_DISPLAY,
  sort: (a, b, rowA, rowB) => Number(rowA.AMT_RAW) - Number(rowB.AMT_RAW)
}
```

---

### R-sel：勾選（`autoCheckBox`）

```vue
<script setup>
const selected = ref([])
</script>
<template>
  <!-- checkbox 多選 -->
  <CustomTable :columns="columns" :rows="rows" selection="multiple" v-model:selected="selected" />
  <!-- radio 單選 -->
  <CustomTable :columns="columns" :rows="rows" selection="single"   v-model:selected="selected" />
</template>
```

取得勾選資料：直接讀取 `selected.value`，對應原始 `tableUI.getCheckedRecords()`。

---

### R-input：可編輯欄（`column.input`）

見子文件 [TableUI/autoInput.md](./TableUI/autoInput.md)

---

### R-server：後端分頁（`isLoadByFatch`）

見子文件 [TableUI/pagination.md](./TableUI/pagination.md)

---

### R-method：命令式方法

| 原始方法 | 翻新方式 |
|---|---|
| `tableUI.loadin(records)` | `rows.value = records` |
| `tableUI.reload()` | 重新呼叫查詢函式（如 `doQuery()`） |
| `tableUI.clear()` | `rows.value = []` |
| `tableUI.getAllRecords()` | `rows.value` |
| `tableUI.getCurrentPageRecords()` | 本地分頁：`rows.value.slice((page-1)*size, page*size)`；後端分頁：`rows.value` |
| `tableUI.getCheckedRecords()` | `selected.value` |
| `tableUI.getUncheckedRecords()` | `rows.value.filter(r => !selected.value.includes(r))` |
| `tableUI.addRecords(records)` | `rows.value = [...rows.value, ...records]` |
| `tableUI.deleteRecords(records)` | `rows.value = rows.value.filter(r => !records.includes(r))` |
| `tableUI.hasRecords()` | `rows.value.length > 0` |
| `tableUI.show()` / `tableUI.hide()` | `v-show` 綁定 ref |
| `tableUI.sort(key, isIncrease)` | `pagination.value = { ...pagination.value, sortBy: key, descending: !isIncrease }` |
| `tableUI.exportAllToXLS(fileName)` | `exportToXls(fileName, columns, rows.value)` |
| `tableUI.exportCheckToXLS(fileName)` | `exportToXls(fileName, columns, selected.value)` |
| `tableUI.resetTotalCount(data)` | 見子文件 [TableUI/totalCount.md](./TableUI/totalCount.md) |
| `tableUI.getErrorRecords()` | `rows.value.filter(r => r._error === true)` |
| `tableUI.setValidRecord(node, isValid)` | `row._error = !isValid`（直接修改 row 物件） |
| `tableUI.getRecordsByCell(cell)` | slot scope 的 `row`（`body-cell-{name}` slot props） |

---

### R-xls：XLS 匯出

```js
import { exportToXls } from '@/assets/utils/exportXls.js'

exportToXls('檔名', columns, rows.value)       // 原 tableUI.exportAllToXLS
exportToXls('檔名', columns, selected.value)   // 原 tableUI.exportCheckToXLS
```

---

### 直接移除

| 原始 config | 原因 |
|---|---|
| `config.headerColumn` / `config.split` | 多列 header 造成版面跑版 |
| `config.overDiv: false` | `CustomTable` 預設無高度限制 |
| `config.fixedColumns` | 頁面自行加 CSS `position: sticky` |
| `config.printMode` | 列印模式，Vue SPA 不使用 |
| `column.groupKey` | 影響排序正確性 |
| `column.fixedColumn` | 頁面自行 CSS sticky |

### Fallback

| 原始 config | 原因 |
|---|---|
| `config.isLoadByFatch` | 後端分頁需頁面自行實作，見 R-server |
| `config.beforeLoad` / `config.afterLoad` | 載入前後 callback，axios 請求前後自行處理 |
| `config.pageChange` / `config.beforePageChange` | 換頁 callback，`@update:pagination` 自行處理 |
| `config.validateRecord` / `config.validateRecordCheckedOnly` | 驗證邏輯，頁面自行實作 |
| `config.allRenderInCount` | 合計列，`bottom-row` slot 自行處理 |
| `config.hiddenColumns` | `visibleColumns` prop 自行管理 |
| `column.hiddenColumn` | `visibleColumns` prop 自行管理 |
| `column.renderInCount` | 合計列，`bottom-row` slot 自行處理 |
| `tableUI.validTable()` | 整表驗證，頁面自行遍歷 `rows.value` |
| `tableUI.getRecordsByCell(cell)` | DOM 操作，slot scope `row` 直接存取 |
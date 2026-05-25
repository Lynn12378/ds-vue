# TableUI.vue — 元件 API

> 以 `q-table` 原生 API 封裝的單一 SFC，還原 TableUI 業務邏輯。  
> 設計原則：能用 q-table prop 解決的，絕不自造 state。

---

## 安裝與引入

```vue
<script setup>
import TableUI from '@/components/common/table/TableUI.vue'
</script>
```

---

## 最簡使用

```vue
<template>
  <TableUI
    :rows="rows"
    :columns="columns"
    row-key="id"
  />
</template>
```

---

## Props

### 核心資料

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `rows` | `Array` | `[]` | `grid.load(records)` |
| `columns` | `Array` | **必填** | `config.column` |
| `row-key` | `String` | `'id'` | 資料唯一鍵 |

### 分頁

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `rows-per-page` | `Number` | `10` | `config.pageSize` |
| `rows-per-page-options` | `Number[]` | `[5,10,20,50,100,0]` | — |
| `server-side` | `Boolean` | `false` | `config.isLoadByFatch` |
| `loading` | `Boolean` | `false` | AJAX loading 狀態 |
| `pagination-label` | `String` | `'第 {page} 頁 / 共 {totalPages} 頁，共 {rowsNumber} 筆'` | `config.recordInfoPattern` |

**server-side 使用：**
```vue
<TableUI
  :rows="rows"
  :columns="columns"
  server-side
  :loading="loading"
  @request="onRequest"
/>
```
```js
// @request handler（對應 TableUI fatch AJAX）
const onRequest = async ({ pagination, filter }) => {
  loading.value = true
  const res = await api.list({
    page: pagination.page,
    size: pagination.rowsPerPage,
    sort: pagination.sortBy,
    desc: pagination.descending,
  })
  rows.value = res.data
  // 回填總筆數（對應 TableUI totalOfRecords）
  tableRef.value.setPagination({ rowsNumber: res.total })
  loading.value = false
}
```

### Selection（autoCheckBox）

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `selection-mode` | `'multiple'｜'single'｜'none'` | `'none'` | `autoCheckBox.type` |
| `selection-config` | `Object` | `null` | `autoCheckBox` 規則設定 |
| `selected` | `Array` | `[]` | `v-model:selected` |

**selectionConfig 結構：**
```js
{
  checkRule:   (row) => Boolean,  // 初始勾選規則（對應 autoCheckBox.checkRule）
  disableRule: (row) => Boolean,  // disabled 規則（對應 autoCheckBox.disableRule）
  visibleRule: (row) => Boolean,  // 顯示規則（對應 autoCheckBox.displayRule）
                                  // false = 隱藏 checkbox（對應 genRule=-99）
}
```

**範例（對應 autoCheckBox 完整設定）：**
```vue
<TableUI
  selection-mode="multiple"
  :selection-config="{
    checkRule:   (row) => row.enabled,
    disableRule: (row) => row.locked,
    visibleRule: (row) => row.showCheckbox !== false,
  }"
  v-model:selected="selectedRows"
  @selection-change="onSelectionChange"
/>
```

### 驗證（validateRecord）

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `validation` | `Object` | `null` | `config.validateRecord` |
| `validate-scope` | `'none'｜'all'｜'checked'` | `'none'` | `validate_type` |

**驗證設定：**
```js
validation: {
  rule: (row, index) => Boolean  // 對應 config.validateRecord function
}
```

**範例：**
```vue
<TableUI
  :validation="{ rule: (row) => !!row.name && row.amount > 0 }"
  validate-scope="all"
/>
```
驗證失敗的列會自動套用 `.table-ui__cell--error` CSS class（對應原版 `error_record`）。

### 合計 / 小計（tfoot）

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `total-row` | `Object` | `null` | `resetTotalCount` |
| `total-row-label` | `String` | `'合計'` | `config.default_total_header` |
| `sub-total-rows` | `Array` | `[]` | `resetSubTotalCount` |

**範例：**
```vue
<TableUI
  :total-row="{ amount: 9999, count: 100 }"
  total-row-label="總計"
  :sub-total-rows="[{ amount: 1234 }, { amount: 5678 }]"
>
  <!-- 自訂合計欄位格式 -->
  <template #total-cell-amount="{ row }">
    <strong>{{ row.amount.toLocaleString() }}</strong>
  </template>
</TableUI>
```

### 欄位顯隱（hiddenGroup）

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `hidden-columns` | `String[]` | `[]` | `hiddenColumns` |
| `show-column-picker` | `Boolean` | `false` | 欄位選擇器 UI |

透過 q-table 原生 `visible-columns` 實現，`required: true` 的欄位永遠顯示（對應 `fixedColumn`）。

```js
// columns 設定中加 required 讓欄位不可隱藏
{ name: 'id', label: 'ID', required: true }
```

### 外觀 / 佈局

| Prop | 型別 | 預設 | 對應 TableUI |
|------|------|------|-------------|
| `sticky-header` | `Boolean` | `true` | `overDiv` 固定表頭 |
| `max-height` | `String` | `'60vh'` | `overDiv.maxHeight` |
| `dense` | `Boolean` | `false` | — |
| `flat` | `Boolean` | `true` | — |
| `bordered` | `Boolean` | `true` | — |
| `separator` | `String` | `'cell'` | — |
| `binary-state-sort` | `Boolean` | `true` | 排序只切 asc/desc |
| `show-search` | `Boolean` | `false` | 搜尋框（TableUI 無此功能，新增） |
| `search-debounce` | `Number` | `300` | — |
| `show-export` | `Boolean` | `false` | 匯出按鈕 |
| `show-pagination` | `Boolean` | `true` | 分頁控制列 |
| `virtual-scroll` | `Boolean` | `false` | 超大資料虛擬捲動 |
| `when-null` | `String` | `''` | `config.whenDataNull` |
| `title` | `String` | `''` | `config.title` |
| `no-data-label` | `String` | `'無資料'` | — |

---

## Emits

| 事件 | 參數 | 對應 TableUI |
|------|------|-------------|
| `update:selected` | `rows[]` | `autoCheckBox.action` / `v-model:selected` |
| `update:hiddenColumns` | `string[]` | — |
| `row-click` | `(evt, row, index)` | `config.rowClick` |
| `page-change` | `(page, pagination)` | `config.pageChange` |
| `request` | `{ pagination, filter }` | server-side `@request` |
| `export-click` | — | 匯出按鈕點擊 |
| `selection-change` | `{ selected, changed, added }` | — |

---

## Expose（ref 方法）

透過 `ref` 呼叫的方法，對應 TableUI 外部 API：

```vue
<TableUI ref="tableRef" ... />
```

| 方法 / 屬性 | 說明 | 對應 TableUI |
|------------|------|-------------|
| `checkAll()` | 全選 | `grid.checkAll()` |
| `uncheckAll()` | 全取消 | `grid.checkAll(false)` |
| `setCheckedByKey(keyVal, bool)` | 依 rowKey 值設定勾選 | `grid.setAutoCheckBoxByValue()` |
| `getCheckedRecords(template?)` | 取得已勾選資料 | `grid.getCheckedRecords()` |
| `innerSelected` | 已選取 rows ref | — |
| `validTable()` | 回傳錯誤筆數 | `grid.validTable()` |
| `errorRowKeys` | 驗證失敗 key Set | — |
| `scrollTop()` | 捲動至頂端 | `grid.scrollTop()` |
| `scrollBottom()` | 捲動至底部 | `grid.scrollBottom()` |
| `getPagination()` | 取得分頁狀態 | `grid.getTableInfo()` |
| `setPagination(info)` | 設定分頁狀態 | `grid.setTableInfo()` |
| `innerPagination` | 分頁狀態 ref | — |
| `filter` | 搜尋關鍵字 ref | — |
| `visibleColumnNames` | 可見欄位 names ref | — |
| `showColumn(name)` | 顯示隱藏欄位 | `settingCtrl.hiddenGroup()` |
| `qTableRef` | 原生 q-table ref | — |

---

## Slots

| Slot | 說明 | 對應 TableUI |
|------|------|-------------|
| `top-left` | 工具列左側自訂 | `tableControl` |
| `top-right` | 工具列右側自訂 | — |
| `body-cell-[name]` | 自訂欄位 cell | `column.render` |
| `total-cell-[name]` | 合計列欄位 | `tfoot` render |
| `subtotal-cell-[name]` | 小計列欄位 | `tfoot` subTotal render |
| `no-data` | 無資料顯示 | `clearRecordsBodies` |
| 其他 q-table slots | 透傳 | — |

**自訂欄位範例：**
```vue
<TableUI :columns="columns" :rows="rows">
  <!-- 對應 TableUI column.render function -->
  <template #body-cell-status="props">
    <q-td :props="props">
      <q-badge :color="props.row.status === 'active' ? 'green' : 'grey'">
        {{ props.value }}
      </q-badge>
    </q-td>
  </template>
</TableUI>
```

---

## columns 定義（對應 TableUI column 設定）

```js
const columns = [
  {
    name:        'id',                   // 唯一識別（對應 TableUI key）
    label:       'ID',                   // 表頭文字
    field:       'id',                   // 資料欄位（或 function(row)）
    required:    true,                   // 永遠顯示（對應 fixedColumn）
    sortable:    true,                   // 可排序（預設 true）
    sortRule:    'number',               // 排序規則：string|number|date|rocdate
    dataType:    'number',               // 資料型態（影響預設 format）
    align:       'right',                // 對齊
    format:      (val, row) => String,   // 顯示格式（對應 TableUI render）
    sort:        (a, b) => Number,       // 自訂排序函式（對應 TableUI sortRule）
    style:       'width: 80px',          // td style（或 function(row)）
    classes:     'my-class',             // td class（或 function(row)）
    headerStyle: 'width: 80px',          // th style
    headerClasses: 'text-center',        // th class
  }
]
```

---

## 完整使用範例

```vue
<script setup>
import { ref } from 'vue'
import TableUI from '@/components/common/table/TableUI.vue'

const tableRef = ref(null)
const loading  = ref(false)
const rows     = ref([])
const selected = ref([])

const columns = [
  { name: 'id',     label: 'ID',   field: 'id',     required: true, sortable: true, sortRule: 'number' },
  { name: 'name',   label: '姓名', field: 'name',   sortable: true },
  { name: 'amount', label: '金額', field: 'amount', sortable: true, sortRule: 'number',
    format: (val) => val?.toLocaleString('zh-TW') },
  { name: 'date',   label: '日期', field: 'date',   sortable: true, sortRule: 'date' },
  { name: 'status', label: '狀態', field: 'status' },
]

// server-side 查詢
const onRequest = async ({ pagination, filter }) => {
  loading.value = true
  try {
    const res = await api.list({
      page: pagination.page,
      size: pagination.rowsPerPage,
      sortBy: pagination.sortBy,
      descending: pagination.descending,
      keyword: filter,
    })
    rows.value = res.records
    tableRef.value.setPagination({ rowsNumber: res.totalOfRecords })
  } finally {
    loading.value = false
  }
}

// 取得勾選資料
const getSelected = () => tableRef.value.getCheckedRecords()

// 驗證
const validate = () => {
  const errorCount = tableRef.value.validTable()
  if (errorCount > 0) console.log(`${errorCount} 筆資料有誤`)
}

// 匯出
const onExportClick = async () => {
  const { useTableExport } = await import('@/composables/useQTable')
  const exporter = useTableExport({ _rows: rows, columns })
  await exporter.exportAllToXLS()
}
</script>

<template>
  <TableUI
    ref="tableRef"
    :rows="rows"
    :columns="columns"
    row-key="id"
    server-side
    :loading="loading"
    selection-mode="multiple"
    :selection-config="{
      checkRule:   (row) => row.preSelected,
      disableRule: (row) => row.locked,
    }"
    v-model:selected="selected"
    :validation="{ rule: (row) => !!row.name }"
    validate-scope="all"
    :total-row="totalRow"
    show-column-picker
    show-search
    show-export
    sticky-header
    max-height="55vh"
    title="資料清單"
    pagination-label="第 {page} 頁 / 共 {totalPages} 頁，共 {rowsNumber} 筆"
    @request="onRequest"
    @selection-change="onSelectionChange"
    @export-click="onExportClick"
  >
    <!-- 自訂狀態欄位 -->
    <template #body-cell-status="props">
      <q-td :props="props">
        <q-badge :color="props.row.status === 'Y' ? 'positive' : 'grey'">
          {{ props.row.status === 'Y' ? '啟用' : '停用' }}
        </q-badge>
      </q-td>
    </template>

    <!-- 自訂工具列右側 -->
    <template #top-right>
      <q-btn label="新增" color="primary" @click="add" />
    </template>
  </TableUI>
</template>
```

---

## q-table 原生 API 對照表

| TableUI 功能 | q-table 原生 API | 說明 |
|-------------|-----------------|------|
| `autoCheckBox checkbox` | `selection="multiple"` + `v-model:selected` | ✅ 原生 |
| `autoCheckBox radio` | `selection="single"` | ✅ 原生 |
| `autoCheckBox checkAll` | `header-selection` slot + `scope.selected` | ✅ 原生 |
| `hiddenGroup` | `visible-columns` prop | ✅ 原生 |
| `fixedColumn（永顯）` | `column.required: true` | ✅ 原生 |
| `fixedColumn（凍結）` | CSS `position: sticky` | ⚠️ CSS 方案 |
| `sortDetail` | `column.sort()` + `binary-state-sort` | ✅ 原生 |
| `isLoadByFatch` | `@request` + `pagination.rowsNumber` | ✅ 原生 |
| `doSettingRender` | `column.format(val, row)` | ✅ 原生 |
| `overDiv sticky header` | `table-style` + CSS `sticky` | ✅ 原生 CSS |
| `recordInfoPattern` | 自訂 `#pagination` slot | ✅ slot |
| `error_record class` | `#body-cell` + `getCellClass()` | ✅ slot |
| `tfoot 合計` | `#bottom-row` slot | ✅ slot |
| `filter` | `:filter` + `:filter-method` | ✅ 原生（新增功能） |
| `rowSpan groupKey` | ❌ 無法還原 | q-table 不支援 rowSpan |

---

## 已知限制

| 功能 | 原因 | 替代方案 |
|------|------|---------|
| rowSpan 合併儲存格 | q-table 無 rowSpan 機制 | ag-Grid / TanStack Table |
| fixedColumn 雙 DOM 凍結 | q-table 架構限制 | `column.required + CSS sticky` |
| autoCheckBox 跨 rowSpan 群組勾選 | 無 rowSpan | 依業務邏輯自訂 checkRule |
# TableUI.js 翻新指引

## Core Principles

**REQUIRED**：

- `new TableUI(config)` 一律翻新為 `CustomTable`（`@/components/common/table/CustomTable.vue`）
- `CustomTable` 以 `rows`、`columns` props 驅動資料，預設已套用 `flat`、`bordered`、`dense`
- 所有命令式操作（`tableUI.loadin()`、`tableUI.getAllRecords()` 等）一律改為直接操作 `ref` 資料
- 原始 `config.column[].key` 對應翻新後 `columns[].name` 與 `columns[].field`

---

## Rules

### R1：`new TableUI(config)` → `CustomTable` props

| 原始 config 參數 | 翻新方式 |
|---|---|
| `table` | 以 `CustomTable` 替換對應 id/DOM 的 `<table>` |
| `column` | 翻新為 `columns` prop，見 R2 |
| `headerColumn` / `split` | 翻新為 `:header-rows` prop，見 R3 |
| `pageSize` | `:pagination="{ rowsPerPage: N }"` |
| `isLoadByFatch` | 後端分頁模式，見 R6 |
| `autoCheckBox` | `selection="multiple"` 或 `selection="single"` + `v-model:selected`，見 R7 |
| `title` | `:title="'標題文字'"` |
| `overDiv.maxHeight: N` | `style="max-height: Npx; overflow: auto;"` + `virtual-scroll` |
| `overDiv: false` | 不傳 `style` 與 `virtual-scroll`，表格高度自動撐開 |
| `fixedColumns` | `:sticky-columns="['COL_NAME']"`，見 R5 |
| `allSortable: false` | 各欄位設定 `sortable: false` |
| `rowClick` | `@row-click="onRowClick"` |
| `beforeLoad` | 改於呼叫 `customAxios` 前執行 |
| `afterLoad` | 改於 `customAxios` 回應後執行 |
| `beforePageChange` | 見 R6，在 `onRequest` handler 開頭自行判斷是否中止 |
| `pageChange` | `@update:pagination="onPaginationChange"` |
| `printMode` | 直接移除 |
| `whenDataNull` | 各欄位加上 `format: (val) => val ?? '　'` |

---

### R2：`column[]` 欄位定義

| 原始 `column` 參數 | 翻新 `columns[]` 參數 |
|---|---|
| `key` | `name`（欄位識別）+ `field`（取值 key 或函式） |
| `header` | `label` |
| `sortable` | `sortable: true` |
| `sortRule` / `sortKey` | 見子文件 [TableUI/sort.md](./TableUI/sort.md) |
| `dataType: 'number'` | `format: (val) => val != null ? Number(val).toLocaleString() : ''` |
| `dataType: 'date'` | `format: (val) => val ?? ''`（西元日期字串直接顯示） |
| `dataType: 'rocdate'` | `format: (val) => val ?? ''`（民國日期字串直接顯示） |
| `render` | 純文字回傳值 → `format: (val, row) => ...`；含元件 → `body-cell-{name}` slot，見 R8 |
| `attrs.colSpan` / `attrs.rowSpan` | 移至 `headerRows` 定義，見 R3 |
| `attrs.align` | `align: 'left' \| 'center' \| 'right'` |
| `classes` / `className` | `classes: 'class-name'` |
| `styles` | `style: 'css-property: value'` |
| `input` | `body-cell-{name}` slot，`{name}` 為該欄位的 `name` 值，見 R8 |
| `groupKey` | `:group-keys="['KEY']"`，見 R4 |
| `fixedColumn: true` | 將此欄位 `name` 加入 `:sticky-columns`，見 R5 |
| `staticWidth: N` | `style: 'width: Npx'` |
| `whenDataNull` | `format: (val) => val ?? '替代文字'` |

---

### R3：多列 Header（`headerColumn` / `split`）

見子文件 [TableUI/headerRows.md](./TableUI/headerRows.md)

---

### R4：列合併（`groupKey`）

見子文件 [TableUI/groupKey.md](./TableUI/groupKey.md)

---

### R5：固定欄位（`fixedColumns`）

`config.fixedColumns` → `:sticky-columns` prop，值改為欄位 `name` 陣列（非原始的 group 編號）。

```vue
<CustomTable
  :columns="columns"
  :rows="rows"
  :sticky-columns="['SEQ', 'NAME']"
/>
```

---

### R6：後端分頁（`isLoadByFatch`）

見子文件 [TableUI/pagination.md](./TableUI/pagination.md)

---

### R7：勾選（`autoCheckBox`）

`config.autoCheckBox` → `selection` prop + `v-model:selected`。

```vue
<script setup>
const selected = ref([])
</script>

<template>
  <!-- checkbox 多選（autoCheckBox type 非 radio） -->
  <CustomTable
    :columns="columns"
    :rows="rows"
    selection="multiple"
    v-model:selected="selected"
  />

  <!-- radio 單選（autoCheckBox type="radio"） -->
  <CustomTable
    :columns="columns"
    :rows="rows"
    selection="single"
    v-model:selected="selected"
  />
</template>
```

取得勾選資料直接讀取 `selected.value`，對應原始 `tableUI.getCheckedRecords()`。

---

### R8：autoInput（`column[].input`）

`column[].input` 定義的可編輯欄位，一律翻新為 `body-cell-{name}` slot 內嵌對應 Quasar 元件，`{name}` 為該欄位定義的 `name` 值。

各 type 的詳細翻新規則與範例見子文件 [TableUI/autoInput.md](./TableUI/autoInput.md)

---

### R9：命令式方法

| 原始方法 | 翻新方式 |
|---|---|
| `tableUI.loadin(records)` | `rows.value = records` |
| `tableUI.reload()` | 重新呼叫資料查詢函式（如 `doQuery()`） |
| `tableUI.clear()` | `rows.value = []` |
| `tableUI.getAllRecords()` | 直接讀取 `rows.value` |
| `tableUI.getCurrentPageRecords()` | 本地分頁：`rows.value.slice((page-1)*size, page*size)`；後端分頁：直接讀取 `rows.value`（已為當頁資料） |
| `tableUI.getCheckedRecords()` | 直接讀取 `selected.value` |
| `tableUI.addRecords(records)` | `rows.value = [...rows.value, ...records]` |
| `tableUI.deleteRecords(records)` | `rows.value = rows.value.filter(r => !records.includes(r))` |
| `tableUI.hasRecords()` | `rows.value.length > 0` |
| `tableUI.resetTotalCount(data)` | 見子文件 [TableUI/totalCount.md](./TableUI/totalCount.md) |
| `tableUI.show()` / `tableUI.hide()` | `v-show` 綁定 `ref<boolean>` |
| `tableUI.exportAllToXLS(fileName)` | `exportToXls(fileName, columns, rows.value)`，見 R10 |
| `tableUI.exportCheckToXLS(fileName)` | `exportToXls(fileName, columns, selected.value)`，見 R10 |
| `tableUI.sort(key, isIncrease)` | `pagination.value = { ...pagination.value, sortBy: key, descending: !isIncrease }` |
| `tableUI.setValueToAutoInput(TR, key, val)` | 直接修改 `row[key] = val`（row 為 `rows.value` 內的物件參考） |
| `tableUI.validTable()` | 遍歷 `rows.value` 執行驗證，將錯誤標記於 row 物件（如 `row._error = true`），再由 `body-cell` slot 或 `:row-class` 顯示錯誤樣式 |

---

### R10：XLS 匯出

```js
import exportToXls from '@/assets/utils/exportXls.js'

// 原始 tableUI.exportAllToXLS('檔名')
exportToXls('檔名', columns, rows.value)

// 原始 tableUI.exportCheckToXLS('檔名')
exportToXls('檔名', columns, selected.value)
```

---

## 常見翻新範例

### JSP 原始

```jsp
<table id="myTable"></table>

<script>
var tableUI = new TableUI({
  table: 'myTable',
  pageSize: 10,
  autoCheckBox: true,
  column: [
    { key: 'SEQ',  header: '序號', fixedColumn: true },
    { key: 'NAME', header: '姓名', sortable: true },
    { key: 'AMT',  header: '金額', dataType: 'number', sortRule: 'number' },
    { key: 'NOTE', header: '備註', input: { type: 'text', maxlength: 50 } }
  ]
})
tableUI.loadin(records)

var checked = tableUI.getCheckedRecords()
tableUI.exportAllToXLS('報表')
</script>
```

### 翻新結果

```vue
<script setup>
import { ref } from 'vue'
import CustomTable from '@/components/common/table/CustomTable.vue'
import exportToXls from '@/assets/utils/exportXls.js'
import customAxios from '@/assets/libs/axios/instance.js'

const rows = ref([])
const selected = ref([])

// R2：key → name+field、header → label、dataType → format、sortRule → sort（見 TableUI/sort.md）
const columns = [
  { name: 'SEQ',  field: 'SEQ',  label: '序號' },
  { name: 'NAME', field: 'NAME', label: '姓名', sortable: true },
  {
    name: 'AMT',
    field: 'AMT',
    label: '金額',
    sortable: true,
    sort: (a, b) => Number(a) - Number(b),
    format: (val) => val != null ? Number(val).toLocaleString() : ''
  },
  { name: 'NOTE', field: 'NOTE', label: '備註' }
]

// R9：tableUI.loadin(records)
const doQuery = async () => {
  const resp = await customAxios.post('{Bean_Name}/query')
  rows.value = resp.records
}

// R9：tableUI.getCheckedRecords()
const doSubmit = () => {
  const checked = selected.value
}

// R10：tableUI.exportAllToXLS('報表')
const doExport = () => {
  exportToXls('報表', columns, rows.value)
}
</script>

<template>
  <!-- R5：fixedColumn → :sticky-columns -->
  <!-- R7：autoCheckBox → selection + v-model:selected -->
  <!-- R1：pageSize → :pagination -->
  <CustomTable
    :columns="columns"
    :rows="rows"
    :sticky-columns="['SEQ']"
    :pagination="{ rowsPerPage: 10 }"
    selection="multiple"
    v-model:selected="selected"
  >
    <!-- R8：column[].input type="text"，slot name 為欄位 name 值 'NOTE' -->
    <template #body-cell-NOTE="props">
      <td>
        <q-input
          v-model="props.row.NOTE"
          dense
          outlined
          :maxlength="50"
        />
      </td>
    </template>
  </CustomTable>
</template>
```
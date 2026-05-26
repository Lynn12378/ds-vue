---
description: JSP `TableUI.js` 舊用法遷移到 Vue3 `TableUI.vue` 新用法對照
---

# TableUI 遷移對照

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| Table 元件 | `import TableUI from '@/components/common/table/TableUI.vue'` | `src/components/common/table/TableUI.vue` |
| Vue ref | `import { ref } from 'vue'` | `vue` |

---

## 屬性轉換

| TableUI 屬性 | QTable 屬性 | 範例 | 引用路徑 |
|-----------------|----------------|---------|
| `pageSize: 20` | `:pagination="{ rowsPerPage: 20 }"` | 直接值映射 | `src/components/common/table/TableUI.vue` |
| `allSortable: true` | `columns[].sortable: true` | 每個欄位加上 sortable | - |
| `autoCheckBox: { type: 'radio' }` | `selection="single"` | radio -> single | `src/components/common/table/TableUI.vue` |
| `autoCheckBox: { type: 'checkbox' }` | `selection="multiple"` | checkbox -> multiple | `src/components/common/table/TableUI.vue` |
| `column.header` | `columns[].label` | 直接映射 | - |
| `column.key` | `columns[].field` | 直接映射 | - |
| `column.attrs.width` | `columns[].style` | 轉換為 style 綁定 | - |
| `column.input` | `<template #body-cell-xxx>` | 詳見下方「column.input 速查表」 | - |

---

## column.input 速查表

> 所有 autoInput 欄位一律使用 `<template #body-cell-{key}>` slot 實作，`dense outlined` 樣式依 Quasar 規範套用。

| `input.type` | Quasar 元件 | 備註 |
|---|---|---|
| `text` | `<q-input dense outlined v-model="row[key]" @update:model-value="...">` | change 事件對應 `input.action` |
| `number` | `<q-input dense outlined type="number" v-model="row[key]" @blur="...">` | blur 事件對應 `input.action` |
| `date` | `<q-input>` + `<q-popup-proxy>` + `<q-date mask="YYYY-MM-DD">` | 詳見 calendar.instructions.md |
| `rocdate` | `<q-input>` + `<q-popup-proxy>` + `<q-date mask="YYYMMDD">` | 詳見 calendar.instructions.md |
| `select` | `<q-select dense outlined emit-value map-options :options="..." v-model="row[key]">` | `opts` 對應 `:options` |
| `checkbox` | `<q-checkbox v-model="row[key]" true-value="Y" false-value="N" @update:model-value="...">` | 單選時 value 為 `'Y'`/`'N'` |
| `radio` | `<q-radio v-model="row[key]" :val="opt.key" @update:model-value="...">` 搭配 `v-for` | `opts` 展開為多個 radio |
| `textarea` | `<q-input dense outlined type="textarea" v-model="row[key]" @update:model-value="...">` | - |
| `button` | `<q-btn dense :label="..." @click="input.action(row)">` | - |
| `show` | 純文字展開，無 input | `shortTextLength` 控制截斷長度 |

```vue
<!-- 範例：type='text' -->
<template #body-cell-REMARK="props">
  <q-td :props="props">
    <q-input
      dense outlined
      v-model="props.row.REMARK"
      @update:model-value="val => onRemarkChange(props.row, val)"
    />
  </q-td>
</template>

<!-- 範例：type='select' -->
<template #body-cell-STATUS="props">
  <q-td :props="props">
    <q-select
      dense outlined
      emit-value map-options
      v-model="props.row.STATUS"
      :options="statusOptions"
      @update:model-value="val => onStatusChange(props.row, val)"
    />
  </q-td>
</template>
```

---

## 建立與呼叫方式轉換

| JSP / TableUI 寫法 | Vue / TableUI 寫法 | 引用路徑 |
|---|---|---|
| `new TableUI(config)` | `<TableUI ref="tableRef" ... />` | `src/components/common/table/TableUI.vue` |
| `grid.load(records)` | `tableRef.value.load(records)` | `src/components/common/table/TableUI.vue` |
| `grid.xxx()` | `tableRef.value.xxx()` | `src/components/common/table/TableUI.vue` |

---

## API 轉換

| 舊 API | 新 API / 用法 | 引用路徑 |
|---|---|
| `grid.load(records)` | `tableRef.value.load(records)` | `src/components/common/table/TableUI.vue` |
| `grid.loadin(records)` | `tableRef.value.loadin(records)` | `src/components/common/table/TableUI.vue` |
| `grid.reload()` | `tableRef.value.reload()` | `src/components/common/table/TableUI.vue` |
| `grid.reloadin()` | `tableRef.value.reloadin()` | `src/components/common/table/TableUI.vue` |
| `grid.clear()` | `tableRef.value.clear()` | `src/components/common/table/TableUI.vue` |
| `grid.checkAll(bool)` | `tableRef.value.checkAll(bool)` | `src/components/common/table/TableUI.vue` |
| `grid.setCurrentPageAutoCheckBox(bool)` | `tableRef.value.setCurrentPageAutoCheckBox(bool)` | `src/components/common/table/TableUI.vue` |
| `grid.setAutoCheckBox(value, bool)` | `tableRef.value.setAutoCheckBox(value, bool)` | `src/components/common/table/TableUI.vue` |
| `grid.setAnotherCheckBox(value, bool)` | `tableRef.value.setAnotherCheckBox(value, bool)` | `src/components/common/table/TableUI.vue` |
| `grid.getCheckedRecord(template?)` | `tableRef.value.getCheckedRecord(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getCheckedRecords(template?)` | `tableRef.value.getCheckedRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getUncheckedRecords(template?)` | `tableRef.value.getUncheckedRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getAllRecords(template?)` | `tableRef.value.getAllRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getCurrentPageRecords(template?)` | `tableRef.value.getCurrentPageRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.validTable()` | `tableRef.value.validTable()` | `src/components/common/table/TableUI.vue` |
| `grid.validCheckedOnTable()` | `tableRef.value.validCheckedOnTable()` | `src/components/common/table/TableUI.vue` |
| `grid.resetValidate()` | `tableRef.value.resetValidate()` | `src/components/common/table/TableUI.vue` |
| `grid.getErrorRecords(template?)` | `tableRef.value.getErrorRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getCorrectRecords(template?)` | `tableRef.value.getCorrectRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getCheckedErrorRecords(template?)` | `tableRef.value.getCheckedErrorRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getCheckedCorrectRecords(template?)` | `tableRef.value.getCheckedCorrectRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.getTableInfo()` | `tableRef.value.getTableInfo()` | `src/components/common/table/TableUI.vue` |
| `grid.setTableInfo(info)` | `tableRef.value.setTableInfo(info)` | `src/components/common/table/TableUI.vue` |
| `grid.setPagination(info)` | `tableRef.value.setPagination(info)` | `src/components/common/table/TableUI.vue` |
| `grid.getPagination()` | `tableRef.value.getPagination()` | `src/components/common/table/TableUI.vue` |
| `grid.addRecords(records)` | `tableRef.value.addRecords(records)` | `src/components/common/table/TableUI.vue` |
| `grid.deleteRecords(records)` | `tableRef.value.deleteRecords(records)` | `src/components/common/table/TableUI.vue` |
| `grid.getDeletedRecords(template?)` | `tableRef.value.getDeletedRecords(template?)` | `src/components/common/table/TableUI.vue` |
| `grid.exportToXLS(file, records, isCount, bgColorType, sheetName)` | `tableRef.value.exportToXLS(...)` | `src/components/common/table/TableUI.vue` |
| `grid.exportAllToXLS(file, isCount, bgColorType, sheetName)` | `tableRef.value.exportAllToXLS(...)` | `src/components/common/table/TableUI.vue` |
| `grid.exportCheckToXLS(file, isCount, bgColorType, sheetName)` | `tableRef.value.exportCheckToXLS(...)` | `src/components/common/table/TableUI.vue` |
| `grid.scrollTop()` | `tableRef.value.scrollTop()` | `src/components/common/table/TableUI.vue` |
| `grid.scrollBottom()` | `tableRef.value.scrollBottom()` | `src/components/common/table/TableUI.vue` |
| `grid.hide()` / `grid.show()` | `tableRef.value.hide()` / `tableRef.value.show()` | `src/components/common/table/TableUI.vue` |
| `grid.resize()` / `grid.resetDivHeight()` | `tableRef.value.resize()` / `tableRef.value.resetDivHeight()` | `src/components/common/table/TableUI.vue` |

---

## 相容層 API 轉換

| 舊 API | 新 API / 用法 | 引用路徑 |
|---|---|
| `grid.isNew` | `tableRef.value.isNew` | `src/components/common/table/TableUI.vue` |
| `grid.getElement` | `tableRef.value.getElement()` | `src/components/common/table/TableUI.vue` |
| `grid.pageCtrl` | `tableRef.value.pageCtrl` | `src/components/common/table/TableUI.vue` |
| `grid.getSerialNumber(...)` | `tableRef.value.getSerialNumber(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getSerialNumbers(...)` | `tableRef.value.getSerialNumbers(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getRecordsBySerialNo(...)` | `tableRef.value.getRecordsBySerialNo(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getRecordsByCell(...)` | `tableRef.value.getRecordsByCell(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getRecordByCell(...)` | `tableRef.value.getRecordByCell(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getDataObjs(...)` | `tableRef.value.getDataObjs(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getDataObj(...)` | `tableRef.value.getDataObj(...)` | `src/components/common/table/TableUI.vue` |
| `grid.hasRecords()` | `tableRef.value.hasRecords()` | `src/components/common/table/TableUI.vue` |
| `grid.setValidRecord(...)` | `tableRef.value.setValidRecord(...)` | `src/components/common/table/TableUI.vue` |
| `grid.setValidRecordByRecord(...)` | `tableRef.value.setValidRecordByRecord(...)` | `src/components/common/table/TableUI.vue` |
| `grid.setThisAutoCheckBox(...)` | `tableRef.value.setThisAutoCheckBox(...)` | `src/components/common/table/TableUI.vue` |
| `grid.isAutoCheckBoxSelected(...)` | `tableRef.value.isAutoCheckBoxSelected(...)` | `src/components/common/table/TableUI.vue` |
| `grid.showAutoCheckBox(...)` | `tableRef.value.showAutoCheckBox(...)` | `src/components/common/table/TableUI.vue` |
| `grid.hideAutoCheckBox(...)` | `tableRef.value.hideAutoCheckBox(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getThisRecordTD(...)` | `tableRef.value.getThisRecordTD(...)` | `src/components/common/table/TableUI.vue` |
| `grid.setValueToTD(...)` | `tableRef.value.setValueToTD(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getAutoInput(...)` | `tableRef.value.getAutoInput(...)` | `src/components/common/table/TableUI.vue` |
| `grid.disableAutoInput(...)` | `tableRef.value.disableAutoInput(...)` | `src/components/common/table/TableUI.vue` |
| `grid.exchangeAutoInput(...)` | `tableRef.value.exchangeAutoInput(...)` | `src/components/common/table/TableUI.vue` |
| `grid.setValueToAutoInput(...)` | `tableRef.value.setValueToAutoInput(...)` | `src/components/common/table/TableUI.vue` |
| `grid.isAutoInputHidden(...)` | `tableRef.value.isAutoInputHidden(...)` | `src/components/common/table/TableUI.vue` |
| `grid.getXlsSettingJSON(...)` | `tableRef.value.getXlsSettingJSON(...)` | `src/components/common/table/TableUI.vue` |
| `grid.resetDiv()` | `tableRef.value.resetDiv()` | `src/components/common/table/TableUI.vue` |
| `grid.resetDivHeight()` | `tableRef.value.resetDivHeight()` | `src/components/common/table/TableUI.vue` |

---

## 事件轉換

| 舊 config callback | 新事件 | 引用路徑 |
|---|---|---|
| `config.rowClick` | `@row-click` | - |
| `config.pageChange` | `@update:pagination` | - |
| fetch callback | `@request` | - |
| `autoCheckBox.action` | `@selection-change` | - |

---

## 動態區塊轉換

```js
// JSP 模式：
// layout.create_XBlock() // 新增行
// layout.deleteData_fromXBlock() // 刪除行
// MaxIndex, UpdateIndex // 索引追蹤

// Vue 模式：
const detailList = ref([])
const selectedIndex = ref(null)

const addRow = () => {
  detailList.value.push({ ...emptyRow })
  selectedIndex.value = detailList.value.length - 1
}

const deleteRow = () => {
  if (selectedIndex.value !== null) {
    detailList.value.splice(selectedIndex.value, 1)
    selectedIndex.value = detailList.value.length > 0 ? 0 : null
  }
}
```

---

## 行為差異（轉換時務必註記）

- `rowSpanByUp/rowSpanByDown/groupKey` 不還原（q-table 不支援原機制）
- `fixedColumns` 雙 table 凍結不還原
- `autoInput` DOM 編輯器家族為相容 API，改為資料層行為或 no-op
- 舊 fetch 三段快取（previous/current/next）不還原
- 匯出改為前端下載 `.xls`，非舊 `/ZRWeb/xls` postback
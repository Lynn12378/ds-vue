# TableUI/totalCount.md — 合計列（resetTotalCount）翻新指引

## 識別 Pattern

```js
// 原始：loadin 第二參數傳入合計資料
tableUI.loadin(records, totalData)

// 或動態更新
tableUI.resetTotalCount(totalData)

// totalData 格式：
// 單筆物件  → { AMT: 99999, COUNT: 10 }
// 多筆陣列  → [{ value: { AMT: 50000 }, text: '小計' }, { value: { AMT: 99999 }, text: '合計' }]
```

---

## 翻新方式

以 `#bottom-row` slot 實作，`totalCount` 為合計資料的 `ref`。

### 單行合計

```vue
<script setup>
const totalCount = ref(null)

// 原始 tableUI.resetTotalCount(data) 或 loadin 第二參數
const setTotal = (data) => {
  totalCount.value = data  // { AMT: 99999, COUNT: 10 }
}
</script>

<template>
  <CustomTable :columns="columns" :rows="rows">
    <template v-if="totalCount" #bottom-row>
      <tr class="bg-grey-2 text-weight-bold">
        <td
          v-for="col in columns"
          :key="col.name"
          class="text-right"
        >
          {{ totalCount[col.field] ?? '' }}
        </td>
      </tr>
    </template>
  </CustomTable>
</template>
```

---

### 多行合計

```vue
<script setup>
const totalRows = ref([])

// 原始格式：[{ value: { AMT: 50000 }, text: '小計' }, { value: { AMT: 99999 }, text: '合計' }]
const setTotal = (data) => {
  totalRows.value = Array.isArray(data) ? data : [{ value: data }]
}
</script>

<template>
  <CustomTable :columns="columns" :rows="rows">
    <template v-if="totalRows.length" #bottom-row>
      <tr
        v-for="(total, idx) in totalRows"
        :key="idx"
        class="bg-grey-2 text-weight-bold"
      >
        <td v-for="(col, colIdx) in columns" :key="col.name" class="text-right">
          <!-- 第一欄顯示合計列標題 -->
          <template v-if="colIdx === 0">{{ total.text ?? '' }}</template>
          <template v-else>{{ total.value?.[col.field] ?? '' }}</template>
        </td>
      </tr>
    </template>
  </CustomTable>
</template>
```

---

## 有 selection 欄時的對齊

**IF** `CustomTable` 設定 `selection` prop **THEN** `#bottom-row` 最前方補一個空 `<td>` 對齊勾選欄：

```vue
<template #bottom-row>
  <tr class="bg-grey-2 text-weight-bold">
    <td />  <!-- 對齊 selection checkbox 欄 -->
    <td
      v-for="col in columns"
      :key="col.name"
      class="text-right"
    >
      {{ totalCount[col.field] ?? '' }}
    </td>
  </tr>
</template>
```

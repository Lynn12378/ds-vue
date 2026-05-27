# TableUI/pagination.md — 後端分頁（isLoadByFatch）翻新指引

## 識別 Pattern

```js
// 原始：isLoadByFatch 為 true 或每批筆數
new TableUI({
  table: 'myTable',
  isLoadByFatch: true,  // 或 isLoadByFatch: 50（每批 50 筆）
  pageSize: 10,
  column: [ ... ]
})

// 啟動查詢
tableUI.loadin(ajaxUrl, queryRules, successCallback, failCallback)

// 重新查詢（相同條件）
tableUI.loadAgain()
```

後端回傳格式：
```json
{
  "totalOfRecords": 100,
  "records": [ ... ]
}
```

---

## 翻新方式

`isLoadByFatch` → `server-side` prop + `@request` handler。

```vue
<script setup>
import { ref, onMounted } from 'vue'
import customAxios from '@/assets/libs/customAxios/index.js'

const rows       = ref([])
const loading    = ref(false)
const pagination = ref({
  page:        1,
  rowsPerPage: 10,   // 原始 pageSize
  rowsNumber:  0     // 後端回傳的總筆數
})

// 原始 tableUI.loadin(ajaxUrl, queryRules, successCb, failCb)
const onRequest = async ({ pagination: p }) => {
  loading.value = true
  try {
    const resp = await customAxios.post('{Bean_Name}/query', {
      // 原始 queryRules 的查詢條件
      loadStart: (p.page - 1) * p.rowsPerPage + 1,
      loadEnd:   p.page * p.rowsPerPage
    })
    rows.value      = resp.records
    pagination.value = { ...p, rowsNumber: resp.totalOfRecords }
  } finally {
    loading.value = false
  }
}

// 原始 tableUI.loadin() 的初次呼叫時機與原始相同：
// 頁面有查詢條件時在查詢按鈕觸發，無查詢條件時在 onMounted 觸發
onMounted(() => {
  onRequest({ pagination: pagination.value })
})

// 原始 tableUI.loadAgain()
const doReload = () => {
  onRequest({ pagination: { ...pagination.value, page: 1 } })
}
</script>

<template>
  <CustomTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    v-model:pagination="pagination"
    server-side
    @request="onRequest"
  />
</template>
```

---

## callback 對應

| 原始參數 | 翻新位置 |
|---|---|
| `successCallback` | `onRequest` 中 `await` 成功後 |
| `failCallback` | `onRequest` 的 `catch` 區塊 |
| `beforePageChange` | `onRequest` 開頭；`return` 可阻止換頁 |
| `pageChange` | `@update:pagination` |
| `beforeLoad` | `loading.value = true` 前 |
| `afterLoad` | `finally` 區塊內 |
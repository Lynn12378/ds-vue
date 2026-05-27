# `TableUI` 子章節：分頁（isLoadByFatch / loadin）

## 識別 pattern
- `config.isLoadByFatch = true | number`
- `tableUI.loadin(ajaxUrl, queryRules, successCb, failCb, ...)`

## 翻新規則
| legacy 設定 | v2 設定 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `isLoadByFatch` 啟用後端分頁 | `server-side` + `@request` handler | `ONE_TO_ONE_REPLACE` | 分頁觸發點改由 `pagination` 狀態驅動 |
| `loadin(url, queryRules, success, fail)` | `customAxios` 請求 + Promise `try/catch/finally` | `ONE_TO_ONE_REPLACE` | 保留 success/fail 行為但改用 async 流程 |
| `beforePageChange/pageChange` | `onRequest` 前置檢查 + `watch(pagination)` | `ONE_TO_ONE_REPLACE` | 阻擋換頁需明確 `return` |

## 請求骨架
```js
import { ref } from 'vue'
import customAxios from '@/assets/libs/customAxios/index.js'

const rows = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

async function onRequest({ pagination: p }) {
  loading.value = true
  try {
    const payload = {
      ...queryRules.value,
      loadStart: (p.page - 1) * p.rowsPerPage + 1,
      loadEnd: p.page * p.rowsPerPage
    }

    const resp = await customAxios.post(queryUrl.value, payload)
    rows.value = resp.records || []
    pagination.value = { ...p, rowsNumber: Number(resp.totalOfRecords || 0) }
  } finally {
    loading.value = false
  }
}
```

## 契約要求
- `rowsNumber` 必須對應後端 `totalOfRecords`。
- page 與 rowsPerPage 必須回寫到同一個 `pagination` ref。
- 初次載入須在 `onMounted` 主動呼叫一次 `onRequest`。

## 禁止事項
- 同時保留 legacy `loadNext/loadPrevious` DOM 按鈕事件與新分頁狀態（會雙重觸發）。
- 以全局變數儲存分頁頁碼，導致多表格互相污染。

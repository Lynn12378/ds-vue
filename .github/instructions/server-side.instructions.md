---
description: JSP 翻新 Vue3 Server-side 資料補償規範
---

# Server-side 資料補償規範

## Core Principles

**REQUIRED**
- JSP 內透過後端注入的資料必須補償至 Vue SFC，確保業務行為等價還原
- 必須封裝 `doPrompt` 函式來處理資料補償邏輯，並在 `onMounted` 生命週期呼叫
- doPrompt 使用 `customAxios(/Bean_Name/prompt)` 來模擬 JSP 頁面初始資料請求，並將回應資料對應補償至 Vue SFC 的對應變數(key 必須對應 JSP 原始碼資料名稱)
- 所有補償資料必須標注 `FIXME: 資料來源待確認`，以利後續人工確認與維護

**FORBIDDEN**
- 禁止將內部宣告的變數視為資料補償對象
- 禁止在 `doPrompt` 以外的函式處理資料補償邏輯

## Example

```js
// DSX01100.vue
import { ref, onMounted } from 'vue'
import customAxios from '@/assets/libs/axios/instance.js'

// ${SELECT_LIST}
const selectList = ref([])

const doPrompt = async () => {
  const resp = await customAxios.get('DSX0_1100/prompt')
  // FIXME: 資料來源待確認
  selectList.value = resp.SELECT_LIST
}

onMounted(() => {
  await doPrompt()
})
```

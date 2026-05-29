# Server-side 資料補全指引

## Core Principles

**REQUIRED**：

- 必須於 `onMounted` 呼叫 `doPrompt` 處理 Server-side 資料補全邏輯
- `doPrompt` 必須使用 `customAxios.get('/api/{Bean_Name}/prompt')` 取得 Response 並賦值需補全的資料
- `doPrompt` 函式定義前必須標注 `// FIXME: Server-side 資料來源待確認`
- 補全的 Response key 必須與 JSP 原始碼的資料名稱**完全一致**

**FORBIDDEN**：

- 禁止在 `doPrompt` 外部處理資料補全邏輯
- 禁止補全非 Server-side 資料來源的項目

## 補全結構

```js
import { ref, onMounted } from 'vue'
import customAxios from '@/assets/plugins/customAxios.js'

// ${原始變數名稱}
const xxx = ref(null)

// FIXME: Server-side 資料來源待確認
const doPrompt = async () => {
  const resp = await customAxios.get('/api/{Bean_Name}/prompt')
  xxx.value = resp.xxx
}

onMounted(async () => {
  await doPrompt()
})
```

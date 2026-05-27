# Server-side 資料補全指引

## Core Principles

**REQUIRED**：

- 必須於 `onMounted` 呼叫 `doPrompt` 處理 Server-side 資料補全邏輯
- `doPrompt` 必須使用 `customAxios.get('{Bean_Name}/prompt')` 取得 Response 並賦值需補全的資料
- 補全的 Response key 必須與 JSP 原始碼的資料名稱**完全一致**
- 所有補全資料必須標注 `// FIXME: Server-side 資料來源待確認`

**FORBIDDEN**：

- 禁止在 `doPrompt` 外部處理資料補全邏輯
- 禁止補全非 Server-side 資料來源的項目

## 補全結構

```js
import { ref, onMounted } from 'vue'
import customAxios from '@/assets/libs/axios/instance.js'

// ${原始變數名稱}
const xxx = ref(null)

const doPrompt = async () => {
  const resp = await customAxios.get('{Bean_Name}/prompt')
  // FIXME: Server-side 資料來源待確認
  xxx.value = resp.xxx
}

onMounted(async () => {
  await doPrompt()
})
```

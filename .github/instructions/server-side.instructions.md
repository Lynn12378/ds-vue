---
description: JSP 翻新 Vue3 Server-side 資料補償規範
---

# Server-side 資料補償規範

## Core Principles

**REQUIRED**
- JSP 後端注入資料必須於 `onMounted` 呼叫 `doPrompt` 補償至 Vue SFC
- `doPrompt` 使用 `customAxios.get('{Bean_Name}/prompt')` 取得後端資料
- 補償變數的 key 必須對應 JSP 原始碼的資料名稱
- 所有補償資料必須標注 `// FIXME: 資料來源待確認`
- `${param.xxx}` 不屬於補償對象，依 R1 直接翻新為 `route.query.xxx`

**FORBIDDEN**
- 禁止將頁面內部宣告的 JS 變數視為補償對象
- 禁止在 `doPrompt` 以外的函式處理資料補償邏輯
- 禁止自行推測補償資料的結構或型別

---

## Example

```jsp
<%-- JSP --%>
<select name="SELECT_LIST" id="SELECT_LIST">
  <c:forEach var="map" items="${SELECT_LIST}">
    <option value="${map.key}">${map.value}</option>
  </c:forEach>
</select>
```

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

onMounted(async () => {
  await doPrompt()
})
```
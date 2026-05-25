---
description: JSP `calendar.js` / `getCalendarFor` → Quasar 日期選擇器翻新指引
---

# 日期選擇器翻新規範

## Core Principles

**REQUIRED**
- `getCalendarFor(elem)` / `<img calendar.gif>` 組合一律替換為 `<q-input>` + `<q-popup-proxy>` + `<q-date>`
- `<q-date>` mask 統一設為 `YYYYMMDD`
- `<q-input>` 必須加上 `clearable` 屬性，對應原始日曆「清」按鈕行為
- 日期顯示格式轉換使用 `tranCEorROCDate`（見 [date.instructions.md](date.instructions.md)）

**FORBIDDEN**
- 禁止實作 calendar.js 內部邏輯
- `autoCreateDate` 不需翻新，由 R2-1 Quasar 元件替換涵蓋

---

## 轉換速查

| JSP | Vue |
|---|---|
| `<input datatype="ROCDate"> + <img calendar.gif>` | `<q-input clearable>` + `<q-popup-proxy>` + `<q-date mask="YYYYMMDD">` |
| `getCalendarFor(elem)` | `<q-popup-proxy>` 內建觸發 |
| `autoCreateDate(elem)` | 不需翻新 |
| 日曆「清」按鈕 | `<q-input clearable>` |

---

## Example

```jsp
<%-- JSP --%>
<input type="text" id="START_DATE" name="START_DATE"
  datatype="ROCDate" class="textBox2 validate-ROCDate"
  maxlength="7" fieldName="起始日期" />
<img src="<%=imageBase%>/CM/calendar.gif" alt="Date"
  onclick="getCalendarFor($('START_DATE'))">
```

```vue
<!-- Vue -->
<q-input
  v-model="startDate"
  dense outlined clearable
  maxlength="7"
  class="textBox2 validate-ROCDate"
  :error="!!errors.startDate"
  :error-message="errors.startDate"
>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="startDate" mask="YYYYMMDD" />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```

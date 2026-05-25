---
description: Quasar Components 使用規範
---

# Quasar Components 使用規範

## Core Principles

**REQUIRED**
- 所有 Quasar 元件統一套用 `dense outlined/bordered` 樣式

## 轉換速查表

| 原始元素 | Quasar 元件 |
|---|---|
| `<table>`（無分頁/排序） | `<q-markup-table>` |
| `<table>`（有分頁/排序） | `<q-table>` |
| `<input type="text/number/password/...">` | `<q-input type="text/number/password/...">` |
| `<input type="text"> + <img calendar.gif>` | `<q-input>` + `<q-popup-proxy>` + `<q-date>` |
| `<input type="radio">` | `<q-radio>` |
| `<input type="checkbox">` | `<q-checkbox>` |
| `<input type="button">` / `<button>` | `<q-btn>` |
| `<select>` | `<q-select>` |
| `<textarea>` | `<q-input type="textarea">` |

---

## radio 與 checkbox 規範

**REQUIRED**
- 同一個選項群組的 radio / checkbox 必須使用相同的 `name` 屬性
- 同一個選項群組必須以 `<q-field>` 包裹，確保正確的錯誤訊息顯示

```vue
<template>
  <q-field
    dense outlined
    :error="!!errors.fieldName"
    :error-message="errors.fieldName"
  >
    <template #control>
      <q-radio v-model="fieldName" name="group1" val="option1" label="選項 1" />
      <q-radio v-model="fieldName" name="group1" val="option2" label="選項 2" />
    </template>
  </q-field>
</template>
```

---

## 日期選擇器規範

`<input type="text"> + <img calendar.gif>` 替換為 `<q-input>` + `<q-popup-proxy>` + `<q-date>`：

```vue
<%-- JSP --%>
<%-- <input type="text" id="START_DATE" class="validate-ROCDate" maxlength="7"> --%>
<%-- <img onclick="getCalendarFor($('START_DATE'))"> --%>
```

```vue
<q-input
  v-model="startDate"
  dense outlined
  maxlength="7"
  :error="!!errors.startDate"
  :error-message="errors.startDate"
>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy cover>
        <q-date v-model="startDate" mask="YYYYMMDD" />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```
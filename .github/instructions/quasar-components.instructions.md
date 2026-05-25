---
description: Quasar Components 使用規範
---

# Quasar Components 使用規範

**REQUIRED**：quasar 統一使用 bordered dense outlined 的樣式

## 轉換速查表

**REQUIRED**：按鈕、表單與表格元件需替換為 Quasar 元件：

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

## radio 與 checkbox 使用規範
**REQUIRED**：同一個選項群組的 radio/checkbox 必須使用相同的 `name` 屬性。

**REQUIRED**：同一個選項群組必須使用`q-field`包裹以確保正確的錯誤訊息顯示。

**EXAMPLE**：

```vue
<template>
<q-field
  :error="!!errors.fieldName"
  :error-message="errors.fieldName"
>
  <q-radio
    v-model="fieldName"
    name="group1"
    val="option1"
    label="選項 1"
  />
  <q-radio
    v-model="fieldName"
    name="group1"
    val="option2"
    label="選項 2"
  />
</q-field>
```

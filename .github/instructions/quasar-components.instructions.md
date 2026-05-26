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

`<input type="text"> + <img calendar.gif>` 的翻新規範詳見 [calendar.instructions.md](jsp/calendar.instructions.md)，包含：
- ROCDate / 西元日期的 mask 對應
- `maxlength` 與格式長度對應規則
- 標準轉換片段（含三種格式範例）
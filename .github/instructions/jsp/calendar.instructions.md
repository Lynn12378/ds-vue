---
description: JSP `calendar.js` / `getCalendarFor` → Quasar 日期選擇器翻新指引
---

# 日期選擇器語法轉換

## Core Principles

**REQUIRED**
- `q-date` 的 `mask` 同時控制元件輸入格式與 `v-model` 綁定值格式
- `q-input` 與 `q-date` 必須共用同一個 ref，不得分離為兩個變數

**FORBIDDEN**
- 禁止將 `q-input` 與 `q-date` 分別綁定不同 ref（會造成輸入與日曆選取不同步）
- 禁止對日期欄位省略 `maxlength`（需與 mask 格式長度對應）

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| Quasar 日期元件 | `<q-input> + <q-popup-proxy> + <q-date>` | - |

---

## 條件式語法轉換對照

| 條件（舊語法） | 新語法（Vue / Quasar） | 引用路徑 |
|---|---|---|
| `<input datatype="ROCDate" maxlength="7"> + getCalendarFor(...)` | `<q-input maxlength="7" clearable>` + `<q-date mask="YYYMMDD" />` | - |
| `<input datatype="DATE">` 且無 `pattern` | `<q-input maxlength="10" clearable>` + `<q-date mask="YYYY-MM-DD" />` | - |
| `<input datatype="DATE" pattern="yyyyMMdd">` | `<q-input maxlength="8" clearable>` + `<q-date mask="YYYYMMDD" />` | - |
| `<input ... readonly>` 或 `<input ... disabled>` | `<q-input readonly>` 或 `<q-input :disable="true">` | - |
| `getCalendarFor(elem)`（elem 可為 id 或 input element） | 由 `<q-popup-proxy>` 內建行為取代 | - |
| `autoCreateDate(elem, delete_imgs)` | 不轉 API，改為元件化日期欄位 | - |
| 日曆「清」功能鍵（舊日曆內 `清`） | `<q-input clearable>` | - |

---

## pattern 轉 mask 速查

| 舊 pattern | 新 `q-date` mask | 引用路徑 |
|---|---|---|
| `yyyMMdd` | `YYYMMDD` | - |
| `yyyy-MM-dd` | `YYYY-MM-DD` | - |
| `yyyyMMdd` | `YYYYMMDD` | - |

---

## 標準轉換片段

### ROCDate 欄位（`maxlength="7"`，mask `YYYMMDD`）

> `q-input` 與 `q-date` 共用同一個 ref，`mask="YYYMMDD"` 確保輸入格式為民國年。

```vue
<script setup>
import { ref } from 'vue'

// START_DATE
const startDate = ref('')
</script>

<template>
  <q-input
    v-model="startDate"
    dense outlined clearable
    maxlength="7"
    :error="!!errors.startDate"
    :error-message="errors.startDate"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="startDate" mask="YYYMMDD" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
```

---

### 西元日期欄位（`maxlength="10"`，mask `YYYY-MM-DD`）

```vue
<!-- START_DATE -->
<q-input
  v-model="startDate"
  dense outlined clearable
  maxlength="10"
  :error="!!errors.startDate"
  :error-message="errors.startDate"
>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="startDate" mask="YYYY-MM-DD" />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```

---

### 西元日期欄位（`maxlength="8"`，mask `YYYYMMDD`）

> 對應 `pattern="yyyyMMdd"` 的舊欄位。

```vue
<!-- START_DATE -->
<q-input
  v-model="startDate"
  dense outlined clearable
  maxlength="8"
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
---
---
description: JSP `calendar.js` / `getCalendarFor` → Quasar 日期選擇器翻新指引
---

# 日期選擇器語法轉換

## Core Principles

**REQUIRED**
- `q-input` 與 `q-date` / `ROCDatePicker` 必須共用同一個 ref，不得分離為兩個變數
- `maxlength` 必須與欄位格式長度一致（見下方對照表）
- ROCDate 欄位一律使用 `<ROCDatePicker>`，禁止對 `q-date` 直接設定 `mask="YYYMMDD"`

**FORBIDDEN**
- 禁止對 `q-date` 使用 `mask="YYYMMDD"`（Quasar 不支援，會輸出錯誤字串如 `26Y0513`）
- 禁止將 `q-input` 與 `q-date` / `ROCDatePicker` 分別綁定不同 ref
- 禁止對日期欄位省略 `maxlength`

---

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| 民國日期選擇器 | `import ROCDatePicker from '@/components/common/ROCDatePicker.vue'` | `src/components/common/ROCDatePicker.vue` |
| 西元日期選擇器 | `<q-input> + <q-popup-proxy> + <q-date>` | - |

---

## 條件式語法轉換對照

| 條件（舊語法） | 新元件 | maxlength | mask / 備註 |
|---|---|---|---|
| `<input datatype="ROCDate" maxlength="7"> + getCalendarFor(...)` | `<ROCDatePicker>` | `7` | v-model 為民國格式 YYYMMDD |
| `<input datatype="DATE">` 且無 `pattern` | `<q-date>` | `10` | `mask="YYYY-MM-DD"` |
| `<input datatype="DATE" pattern="yyyyMMdd">` | `<q-date>` | `8` | `mask="YYYYMMDD"` |
| `<input datatype="DATE" pattern="yyyy-MM-dd">` | `<q-date>` | `10` | `mask="YYYY-MM-DD"` |
| `<input ... readonly>` 或 `<input ... disabled>` | 同上，加 `readonly` / `:disable="true"` | - | 透傳至 `q-input` |
| `getCalendarFor(elem)` | 由 `<q-popup-proxy>` 內建行為取代 | - | - |
| `autoCreateDate(elem, delete_imgs)` | 不轉 API，改為元件化日期欄位 | - | - |
| 日曆「清」功能鍵 | `<q-input clearable>` | - | - |

---

## pattern 轉 mask 速查

| 舊 pattern | 新 `q-date` mask | maxlength |
|---|---|---|
| `yyyMMdd` | 改用 `<ROCDatePicker>`，不設 mask | `7` |
| `yyyy-MM-dd` | `YYYY-MM-DD` | `10` |
| `yyyyMMdd` | `YYYYMMDD` | `8` |

---

## 標準轉換片段

### ROCDate 欄位 → `<ROCDatePicker>`

> `ROCDatePicker` 對外 v-model 接受/輸出民國格式 `YYYMMDD`（例：`'1141225'`）。
> header 顯示民國年，日曆格內日期數字為西元（q-date 底層限制）。

```vue
<script setup>
import { ref } from 'vue'
import ROCDatePicker from '@/components/common/ROCDatePicker.vue'

// START_DATE（民國格式 YYYMMDD）
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
          <ROCDatePicker v-model="startDate" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
```

---

### 西元日期欄位（`YYYY-MM-DD`，maxlength 10）

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
</template>
```

---

### 西元日期欄位（`YYYYMMDD`，maxlength 8）

> 對應 `pattern="yyyyMMdd"` 的舊欄位。

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
</template>
```

---

## ROCDatePicker 元件說明

> 路徑：`src/components/common/ROCDatePicker.vue`

| 項目 | 說明 |
|---|---|
| `v-model` | 民國格式字串 `YYYMMDD`，例：`'1141225'` |
| 內部轉換 | 對外民國 ↔ 對內西元，透過 `useCommon().tranCEorROCDate()` |
| header title | 顯示 `民國 114/12/25` |
| header subtitle | 顯示 `民國 114 年`，點擊切換年份選擇視圖 |
| 日曆格數字 | 西元年（q-date 底層限制，無法修改） |
| 額外 props | 透過 `v-bind="$attrs"` 透傳至 `q-date`（`options`、`readonly`、`disable` 等） |
| 使用限制 | 不可在 `minimal` 模式下使用（`minimal` 會隱藏 header，民國年標題將消失） |
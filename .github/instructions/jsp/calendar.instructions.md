---
description: JSP `calendar.js` / `getCalendarFor` → Quasar 日期選擇器翻新指引
---

# 日期選擇器語法轉換

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| 日期轉換工具（選用） | `import useCommon from '@/assets/utils/common.js'` | `src/assets/utils/common.js` |
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

```vue
<q-input
  v-model="startDate"
  dense
  outlined
  clearable
  maxlength="7"
>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="startDate" mask="YYYMMDD" />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```

---

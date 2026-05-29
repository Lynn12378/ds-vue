# TableUI/autoInput.md — autoInput（column.input）翻新指引

## Core Principles

**REQUIRED**：
- `column[].input` 定義的可編輯欄位，一律翻新為 `#body-cell-{name}` slot 嵌入對應 Quasar 元件
- slot 名稱的 `{name}` 為該欄位 `columns[].name` 的值
- 直接操作 `props.row.FIELD_NAME` 更新資料，不需額外事件

---

## autoInput type 對應表

| 原始 `input.type` | 翻新元件 |
|---|---|
| `text` | `q-input` |
| `number` | `q-input type="number"` |
| `date` | `q-input` + `CustomDate` popup（西元） |
| `rocdate` | `q-input` + `CustomDate` popup + `:datatype="'ROC'"` |
| `textarea` | `q-input type="textarea"` |
| `select` | `q-select` |
| `checkbox`（單一） | `q-checkbox` |
| `checkbox`（含 `opts`） | 多個 `q-checkbox` |
| `radio`（含 `opts`） | 多個 `q-radio` |
| `button` | `q-btn` |
| `show` | 純文字 + CSS 截斷 |

---

## 共用屬性對應

| 原始 `input` 參數 | 翻新寫法 |
|---|---|
| `disableRule` | `:disable="disableRule(props.row)"` |
| `readOnlyRule` | `:readonly="readOnlyRule(props.row)"` |
| `genRule` | `v-if="genRule(props.row)"` 包裹 slot 內容 |
| `action` | `@update:model-value` 或 `@click` 內呼叫 |
| `maxlength` | `:maxlength="N"` |
| `followText` | input 後方放置 `<span>文字</span>` |
| `easyEdit` | 見 easyEdit 範例 |

---

## 翻新範例

### text

```vue
<template #body-cell-FIELD_NAME="props">
  <td>
    <q-input
      v-model="props.row.FIELD_NAME"
      dense
      outlined
      :maxlength="10"
      :disable="disableRule(props.row)"
      :readonly="readOnlyRule(props.row)"
    />
  </td>
</template>
```

---

### number

原始 `input.type: 'number'` 為文字欄位加數字格式驗證（非 HTML number input），翻新為 `q-input` + `keypressNumberOnly` keydown 限制：

```vue
<script setup>
import { keypressNumberOnly } from '@/assets/utils/utility.js'
</script>

<template #body-cell-AMT="props">
  <td>
    <q-input
      v-model="props.row.AMT"
      dense
      outlined
      :disable="disableRule(props.row)"
      @keydown="(e) => keypressNumberOnly(e.keyCode)"
    />
  </td>
</template>
```

---

### date（西元）

```vue
<template #body-cell-START_DATE="props">
  <td>
    <q-input v-model="props.row.START_DATE" dense outlined clearable>
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy>
            <CustomDate v-model="props.row.START_DATE" minimal :today-btn="true" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </td>
</template>
```

---

### rocdate（民國）

```vue
<template #body-cell-ROC_DATE="props">
  <td>
    <q-input v-model="props.row.ROC_DATE" dense outlined clearable>
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy>
            <CustomDate
              v-model="props.row.ROC_DATE"
              :datatype="'ROC'"
              minimal
              :today-btn="true"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </td>
</template>
```

---

### textarea

```vue
<template #body-cell-MEMO="props">
  <td>
    <q-input
      v-model="props.row.MEMO"
      type="textarea"
      dense
      outlined
      :maxlength="200"
      autogrow
    />
  </td>
</template>
```

---

### select

```vue
<template #body-cell-STATUS="props">
  <td>
    <q-select
      v-model="props.row.STATUS"
      :options="statusOptions"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      dense
      outlined
      :disable="disableRule(props.row)"
    />
  </td>
</template>
```

---

### checkbox（單一，值為 `Y` / `N`）

```vue
<template #body-cell-IS_ENABLE="props">
  <td>
    <q-checkbox
      :model-value="props.row.IS_ENABLE === 'Y'"
      dense
      :disable="disableRule(props.row)"
      @update:model-value="(val) => { props.row.IS_ENABLE = val ? 'Y' : 'N' }"
    />
  </td>
</template>
```

---

### checkbox（含 `opts`，多選逗號分隔）

```vue
<template #body-cell-TYPES="props">
  <td>
    <q-checkbox
      v-for="opt in typeOpts"
      :key="opt.value"
      :model-value="props.row.TYPES?.split(',').includes(opt.value)"
      :label="opt.label"
      dense
      @update:model-value="(checked) => {
        const vals = new Set(props.row.TYPES?.split(',').filter(Boolean))
        checked ? vals.add(opt.value) : vals.delete(opt.value)
        props.row.TYPES = [...vals].join(',')
      }"
    />
  </td>
</template>
```

---

### radio（含 `opts`）

```vue
<template #body-cell-GENDER="props">
  <td>
    <q-radio
      v-for="opt in genderOpts"
      :key="opt.value"
      v-model="props.row.GENDER"
      :val="opt.value"
      :label="opt.label"
      dense
    />
  </td>
</template>
```

---

### button

```vue
<template #body-cell-ACTION="props">
  <td>
    <q-btn
      label="檢視"
      dense
      flat
      :disable="disableRule(props.row)"
      @click="onAction(props.row)"
    />
  </td>
</template>
```

---

### show（純文字截斷）

```vue
<template #body-cell-REMARK="props">
  <td>
    <div
      style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
      :title="props.row.REMARK"
    >
      {{ props.row.REMARK }}
    </div>
  </td>
</template>
```

---

### easyEdit 模式

```vue
<script setup>
// ref(new Set()) 的 Set mutation 不觸發響應式，改用 ref(new Set()) + 重建方式
const editingRows = ref(new Set())

const isEditing = (row) => editingRows.value.has(row)
const startEdit = (row) => { editingRows.value = new Set([...editingRows.value, row]) }
const stopEdit  = (row) => {
  const next = new Set(editingRows.value)
  next.delete(row)
  editingRows.value = next
}
</script>

<template #body-cell-NAME="props">
  <td @click="startEdit(props.row)">
    <span v-if="!isEditing(props.row)">{{ props.row.NAME }}</span>
    <q-input
      v-else
      v-model="props.row.NAME"
      dense
      outlined
      autofocus
      @blur="stopEdit(props.row)"
    />
  </td>
</template>
```
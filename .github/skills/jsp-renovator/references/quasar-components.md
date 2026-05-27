# Quasar 元件翻新指引

## Core Principles

### 資料綁定

- 所有表單元件必須使用 `v-model` 綁定資料
- 表單元素的 `name` 必須完整保留
- 原始 HTML 元素的 `class` 必須完整保留

### 屬性保留

- `readonly`、`disabled` 屬性必須保留並改為 binding（`:readonly`、`:disabled`）

### 驗證錯誤

- **IF** 表單有驗證狀態 **THEN** 必須綁定 `:error="!!errors.fieldName"` 與 `:error-message="errors.fieldName"`
- 同層 `<td>` 的表單元件必須必須使用 `q-field`
- 相同 `name` 屬性的 q-checkbox、q-radio 必須使用 `q-field` 包裹；**IF** 有驗證狀態 **THEN** 由外層 `q-field` 統一處理 `:error` 與 `:error-message`

### 樣式風格

- 所有 Quasar 元件必須加上 `dense`
- 表單輸入元件（q-input、q-select、q-file）：必須加上 `outlined`
- `q-field`：必須加上 `borderless`
- 表格元件（q-markup-table）：必須加上 `bordered` + `flat`

### q-select 選項綁定

- `options` 綁定選項清單
- 必須加上 `emit-value` + `map-options`，直接回傳 value 而非整個物件
- `option-value` 對應選項值的 key
- `option-label` 對應選項顯示文字的 key

**FORBIDDEN**：禁止移除原始 HTML 元素的 `class`

---

## 轉換範例

### 表單輸入

```vue
<!-- JSP -->
<input
  id="FIELD_NAME"
  name="FIELD_NAME"
  type="text"
  class="textBox2"
  maxlength="10"
  readonly
/>

<!-- Vue -->
<!-- 有驗證規則時加入 :error="!!errors.FIELD_NAME" :error-message="errors.FIELD_NAME" -->
<q-input
  id="FIELD_NAME"
  name="FIELD_NAME"
  v-model="FIELD_NAME"
  class="textBox2"
  :maxlength="10"
  :readonly="true"
  dense
  outlined
/>
```

### 選擇元件群組（q-field 包裹）

```vue
<!-- JSP -->
<input type="radio" name="STATUS" class="radio" value="1" />啟用
<input type="radio" name="STATUS" class="radio" value="2" />停用

<!-- Vue -->
<!-- 有驗證規則時加入 :error="!!errors.STATUS" :error-message="errors.STATUS" -->
<q-field
  dense
  borderless
>
  <q-radio v-model="STATUS" name="STATUS" class="radio" val="1" dense />啟用
  <q-radio v-model="STATUS" name="STATUS" class="radio" val="2" dense />停用
</q-field>
```

### 表格

```vue
<!-- JSP -->
<table width="100%" cellpadding="0" cellspacing="1" class="tbBox2">
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
    <td>
      <input type="number" name="AMOUNT" class="textBox2" />
      <input type="text" name="DESCRIPTION" class="textBox2" />
    </td>
  </tr>
</table>

<!-- Vue -->
<!-- :style 為廢棄 HTML 屬性翻新，並非推論樣式 -->
<q-markup-table
  class="tbBox2"
  flat
  bordered
  dense
  :style="{ width: '100%', borderSpacing: '1px' }"
>
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
    <td>
      <q-field
        dense
        borderless
      >
        <q-input v-model="AMOUNT" name="AMOUNT" class="textBox2" type="number" dense outlined />
        <q-input v-model="DESCRIPTION" name="DESCRIPTION" class="textBox2" dense outlined />
      </q-field>
  </tr>
</q-markup-table>
```

### 通知元件

```vue
<script setup>
import { useQuasar } from 'quasar'
const $q = useQuasar()

// alert(...)
$q.dialog({
  message: '原始訊息內容',
})

// confirm(...)
$q.dialog({
  message: '原始訊息內容',
  cancel: true,
}).onOk(() => {
  // 確認後的處理
}).onCancel(() => {
  // 取消後的處理
})
</script>
```
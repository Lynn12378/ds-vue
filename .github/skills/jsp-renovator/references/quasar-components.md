# Quasar 元件翻新指引

## Core Principles

**REQUIRED**：

- 所有表單元件必須使用 `v-model` 綁定資料
- 原始 HTML 元素的 `class` 必須完整保留
- 表單元素的 `name` 必須完整保留
- `readonly`、`disabled` 屬性必須保留並改為 binding（`:readonly`、`:disabled`）
- 表單驗證錯誤訊息必須綁定至 `:error` 與 `:error-message`
- 表單輸入元件（QInput、QSelect、QFile）：必須加上 `dense` + `outlined`
- 選擇元件（QCheckbox、QRadio）：必須加上 `dense`，錯誤訊息由外層 `q-field` 的 `:error` 與 `:error-message` 處理
- 相同 `name` 屬性的 QCheckbox、QRadio 必須使用 `q-field` 包裹，`q-field` 必須加上 `dense` + `borderless`
- 表格元件（QMarkupTable）：必須加上 `dense` + `bordered`

**FORBIDDEN**：禁止移除原始 HTML 元素的 `class`

---

## 表單輸入元件

### QInput

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `string` | 綁定欄位值 |
| `type` | `string` | 輸入類型，預設 `text` |
| `maxlength` | `number` | 最大輸入長度，對應原始 `maxlength` |
| `readonly` | `boolean` | 唯讀，對應原始 `readonly` |
| `disabled` | `boolean` | 停用，對應原始 `disabled` |
| `dense` | `boolean` | 緊湊模式 |
| `outlined` | `boolean` | 外框風格 |
| `:error` | `boolean` | 是否顯示錯誤狀態，綁定 `!!errors.fieldName` |
| `:error-message` | `string` | 錯誤訊息，綁定 `errors.fieldName` |

### QSelect

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `any` | 綁定選取值 |
| `options` | `array` | 選項清單 |
| `option-value` | `string` | 選項值的 key |
| `option-label` | `string` | 選項顯示文字的 key |
| `emit-value` | `boolean` | 直接回傳 value 而非整個物件 |
| `map-options` | `boolean` | 配合 `emit-value` 使用 |
| `readonly` | `boolean` | 唯讀 |
| `disabled` | `boolean` | 停用 |
| `dense` | `boolean` | 緊湊模式 |
| `outlined` | `boolean` | 外框風格 |
| `:error` | `boolean` | 是否顯示錯誤狀態，綁定 `!!errors.fieldName` |
| `:error-message` | `string` | 錯誤訊息，綁定 `errors.fieldName` |

### QCheckbox

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `boolean \| array` | 綁定勾選狀態 |
| `val` | `any` | 多選時對應的值，對應原始 `value` |
| `label` | `string` | 顯示文字 |
| `disable` | `boolean` | 停用 |
| `dense` | `boolean` | 緊湊模式 |

### QRadio

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `any` | 綁定選取值 |
| `val` | `any` | 此選項對應的值，對應原始 `value` |
| `label` | `string` | 顯示文字 |
| `disable` | `boolean` | 停用 |
| `dense` | `boolean` | 緊湊模式 |

### QBtn

| Props | 型別 | 說明 |
|---|---|---|
| `label` | `string` | 按鈕文字，對應原始 `value` |
| `@click` | `function` | 點擊事件，對應原始 `onclick` |
| `disable` | `boolean` | 停用 |
| `dense` | `boolean` | 緊湊模式 |

### QFile

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `File \| File[]` | 綁定檔案 |
| `accept` | `string` | 允許的檔案類型，對應原始 `accept` |
| `multiple` | `boolean` | 是否允許多選，對應原始 `multiple` |
| `dense` | `boolean` | 緊湊模式 |
| `outlined` | `boolean` | 外框風格 |

### q-field

相同 `name` 屬性的 `QCheckbox` 與 `QRadio` 必須使用 `q-field` 包裹，統一處理錯誤訊息顯示。

| Props | 型別 | 說明 |
|---|---|---|
| `:error` | `boolean` | 是否顯示錯誤狀態，綁定 `!!errors.fieldName` |
| `:error-message` | `string` | 錯誤訊息，綁定 `errors.fieldName` |
| `dense` | `boolean` | 緊湊模式 |
| `borderless` | `boolean` | 移除邊框，避免與內部元件樣式衝突 |

### 轉換範例

```vue
<!-- JSP：表單輸入 -->
<input
  id="FIELD_NAME"
  name="FIELD_NAME"
  type="text"
  class="textBox2"
  maxlength="10"
  readonly
/>

<!-- Vue -->
<QInput
  id="FIELD_NAME"
  name="FIELD_NAME"
  v-model="FIELD_NAME"
  class="textBox2"
  :maxlength="10"
  :readonly="true"
  dense
  outlined
  :error="!!errors.FIELD_NAME"
  :error-message="errors.FIELD_NAME"
/>

<!-- JSP：選擇元件群組 -->
<input type="radio" name="STATUS" class="radio" value="1" />啟用
<input type="radio" name="STATUS" class="radio" value="2" />停用

<!-- Vue -->
<q-field
  dense
  borderless
  :error="!!errors.STATUS"
  :error-message="errors.STATUS"
>
  <QRadio
    v-model="STATUS"
    name="STATUS"
    class="radio"
    val="1"
    dense
  />啟用
  <QRadio
    v-model="STATUS"
    name="STATUS"
    class="radio"
    val="2"
    dense
  />停用
</q-field>
```

---

## 表格元件

### QMarkupTable

| Props | 型別 | 說明 |
|---|---|---|
| `flat` | `boolean` | 移除陰影 |
| `bordered` | `boolean` | 顯示邊框，對應原始 `border` |
| `dense` | `boolean` | 緊湊模式 |

### 轉換範例

```vue
<!-- JSP -->
<table width="100%" cellpadding="0" cellspacing="1" class="tbBox2">
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
  </tr>
</table>

<!-- Vue -->
<QMarkupTable
  class="tbBox2"
  flat
  bordered
  dense
  :style="{ width: '100%', borderSpacing: '1px' }"
>
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
  </tr>
</QMarkupTable>
```

> 此範例 `QMarkupTable` 新增的 :style 為棄用 HTML 屬性翻新，並非推論樣式

---

## 通知元件

### QDialog（alert / confirm）

### 轉換範例

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
# Quasar 元件翻新指引

## Rules

**REQUIRED**：

- 所有表單元件必須使用 `v-model` 綁定資料
- 原始 HTML 元素的 `name`、`class` 必須完整保留
- `readonly`、`disabled` 屬性必須保留並改為 binding（`:readonly`、`:disabled`）
- 表單驗證錯誤訊息必須綁定至 `:error` 與 `:error-message`
- 必須使用 `dense` 和 `outlined` / `bordered` 風格以符合原始樣式

**FORBIDDEN**：禁止移除原始 HTML 元素的 `class`

---

## QInput

### 適用 JSP Pattern

- `<input type="text">`
- `<input type="password">`
- `<textarea>`

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `string` | 綁定欄位值 |
| `label` | `string` | 欄位標籤 |
| `type` | `string` | 輸入類型，預設 `text` |
| `maxlength` | `number` | 最大輸入長度，對應原始 `maxlength` |
| `readonly` | `boolean` | 唯讀，對應原始 `readonly` |
| `disabled` | `boolean` | 停用，對應原始 `disabled` |
| `:error` | `boolean` | 是否顯示錯誤狀態，綁定 `!!errors.fieldName` |
| `:error-message` | `string` | 錯誤訊息，綁定 `errors.fieldName` |

### 標準結構

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
<QInput
    name="FIELD_NAME"
    v-model="FIELD_NAME"
    class="textBox2"
    :maxlength="10"
    :readonly="true"
    :error="!!errors.FIELD_NAME"
    :error-message="errors.FIELD_NAME"
/>
```

---

## QSelect

### 常用 Props

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

### 標準結構

```vue
<!-- JSP -->
<select id="CITY" name="CITY" class="selectBox">
  <c:forEach var="map" items="${CITY_LIST}">
    <option value="${map.key}">${map.value}</option>
  </c:forEach>
</select>

<!-- Vue -->
<QSelect
  v-model="CITY"
  name="CITY"
  class="selectBox"
  :options="cityList"
  option-value="key"
  option-label="value"
  emit-value
  map-options
  dense
  outlined
  :error="!!errors.CITY"
  :error-message="errors.CITY"
/>
```

---

## QCheckbox

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `boolean \| array` | 綁定勾選狀態 |
| `val` | `any` | 多選時對應的值，對應原始 `value` |
| `label` | `string` | 顯示文字 |
| `disable` | `boolean` | 停用 |

### 標準結構

```vue
<!-- JSP -->
<input type="checkbox" id="AGREE" name="AGREE" class="checkbox" value="Y" />

<!-- Vue -->
<QCheckbox
  v-model="AGREE"
  name="AGREE"
  class="checkbox"
  val="Y"
/>
```

---

## QRadio

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `any` | 綁定選取值 |
| `val` | `any` | 此選項對應的值，對應原始 `value` |
| `label` | `string` | 顯示文字 |
| `disable` | `boolean` | 停用 |

### 標準結構

```vue
<!-- JSP -->
<input type="radio" id="r_query" name="functionSwitch" class="radio" value="0" />
<input type="radio" id="r_areaCodeQuery" name="functionSwitch" class="radio" value="1" />

<!-- Vue -->
<QRadio
  v-model="functionSwitch"
  name="functionSwitch"
  class="radio"
  val="0"
/>
<QRadio
  v-model="functionSwitch"
  name="functionSwitch"
  class="radio"
  val="1"
/>
```

---

## QBtn

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `label` | `string` | 按鈕文字，對應原始 `value` |
| `@click` | `function` | 點擊事件，對應原始 `onclick` |
| `disable` | `boolean` | 停用 |

### 標準結構

```vue
<!-- JSP -->
<input
  id="btn_query"
  name="btn_query"
  type="button"
  class="button"
  value="查詢"
/>

<!-- Vue -->
<QBtn
  class="button"
  label="查詢"
  @click="doQuery"
/>
```

---

## QFile

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `v-model` | `File \| File[]` | 綁定檔案 |
| `accept` | `string` | 允許的檔案類型，對應原始 `accept` |
| `multiple` | `boolean` | 是否允許多選，對應原始 `multiple` |
| `dense` | `boolean` | 緊湊模式 |
| `outlined` | `boolean` | 外框風格 |

### 標準結構

```vue
<!-- JSP -->
<input type="file" id="UPLOAD_FILE" name="UPLOAD_FILE" class="fileInput" accept=".pdf" />

<!-- Vue -->
<QFile
  v-model="UPLOAD_FILE"
  name="UPLOAD_FILE"
  class="fileInput"
  accept=".pdf"
  dense
  outlined
/>
```

---

## QMarkupTable

### 常用 Props

| Props | 型別 | 說明 |
|---|---|---|
| `flat` | `boolean` | 移除陰影 |
| `bordered` | `boolean` | 顯示邊框，對應原始 `border` |
| `dense` | `boolean` | 緊湊模式 |

### 標準結構

```vue
<!-- JSP -->
<table width="100%" cellpadding="0" cellspacing="1" class="tbBox2">
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
  </tr>
</table>

<!-- Vue -->
<QMarkupTable class="tbBox2" bordered flat dense :style="{ width: '100%', borderSpacing: '1px' }">
  <tr>
    <td class="tbYellow">欄位</td>
    <td class="tbYellow2">值</td>
  </tr>
</QMarkupTable>
```

---

## QDialog（alert / confirm）

### 標準結構

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
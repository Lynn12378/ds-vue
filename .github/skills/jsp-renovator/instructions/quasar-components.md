# Quasar 元件規範

## 元件速查表

| HTML 元素 | Quasar 元件 |
|---|---|
| `<input type="text">`、`<input type="number">` 等 | `<q-input type="...">` |
| `<input type="radio">` | `<q-radio>` |
| `<input type="checkbox">` | `<q-checkbox>` |
| `<input type="file">` | `<q-file>` |
| `<input>` + calendar.gif | `<q-input>` + `<q-icon name="event">`，需參照 [calendar.js 翻新指引](../references/js/calendar.js.md) |
| `<select>` | `<q-select>` |
| `<textarea>` | `<q-input type="textarea">` |
| `<table>`（一般表格） | `<q-markup-table>` |
| `<table id=tableId>` + `TableUI(tableId)` | `<q-table>`，需參照 [TableUI 翻新指引](../references/js/TableUI.js.md) |
| `<button>`、`<input type="button">`、`<input type="submit">` | `<q-btn>` |

---

## 撰寫規範

### 資料綁定、屬性保留

- 所有表單元件必須使用 `v-model` 綁定資料
- 表單元素的 `name` 必須完整保留
- `readonly`、`disabled` 屬性必須保留並改為 binding（`:readonly`、`:disabled`）

### q-field 使用規則

`q-field` 作為**視覺容器**，本身不綁定資料（不加 `v-model`）：

- **REQUIRED**：同層 `<td>` 內有表單元件，一律以 `q-field` 包裹
- **REQUIRED**：`q-field` 必須加上 `dense` + `borderless`
- **REQUIRED**：群組相同 `name` 的 `q-radio`、`q-checkbox`，由外層 `q-field` 統一處理驗證錯誤，子元件不個別綁定

### 樣式風格

- 所有 Quasar 表單元件必須加上 `dense`
- 表單輸入元件（`q-input`、`q-select`、`q-file`）：必須加上 `outlined`
- `q-field`：必須加上 `borderless`
- `q-markup-table`：必須加上 `flat` + `bordered` + `dense`
- `q-table`：必須加上 `flat` + `bordered` + `dense`
- 原始 HTML 元素的 `class` 必須完整保留至對應的 Quasar 元件
- **FORBIDDEN**：禁止移除原始 HTML 元素的 `class`

### q-select 選項綁定

- `options` 綁定選項清單
- 必須加上 `emit-value` + `map-options`，直接回傳 value 而非整個物件
- `option-value` 對應選項值的 key
- `option-label` 對應選項顯示文字的 key

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
<td>
  <q-field dense borderless>
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
  </q-field>
</td>
```

### 選擇元件群組（q-field 包裹）

```vue
<!-- JSP -->
<input type="radio" name="STATUS" class="radio" value="1" />啟用
<input type="radio" name="STATUS" class="radio" value="2" />停用

<!-- Vue -->
<td>
  <q-field dense borderless>
    <q-radio v-model="STATUS" name="STATUS" class="radio" val="1" dense />啟用
    <q-radio v-model="STATUS" name="STATUS" class="radio" val="2" dense />停用
  </q-field>
</td>
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
      <q-field dense borderless>
        <q-input v-model="AMOUNT" name="AMOUNT" class="textBox2" type="number" dense outlined />
        <q-input v-model="DESCRIPTION" name="DESCRIPTION" class="textBox2" dense outlined />
      </q-field>
    </td>
  </tr>
</q-markup-table>
```

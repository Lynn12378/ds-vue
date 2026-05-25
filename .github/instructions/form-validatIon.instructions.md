---
description: JSP `validation.js` → VeeValidate + Yup + Quasar 翻新指引
---

# 表單驗證翻新規範

## Core Principles

**REQUIRED**
- Yup 規則一律具名引用
- 優先使用 CathayValidateRules.js
- schema key 必須對應原始欄位 `id`/`name`（camelCase）
- schema 只納入有驗證規則的欄位
- 無論有無驗證規則，form 內所有欄位一律 `useField` 宣告
- `useForm` 所有欄位必須設定 `initialValues` 與 `validateOnMount: false`
- 全局驗證規則必須依 `CSS Class → Yup Mapping` 對照表轉換
- JSP 自訂規則（`add` / `addAllThese`）識別為頁面內自訂驗證邏輯，必須抽出為頁面內共用箭頭函式，再以 `.test()` 引用，函式名稱對應原始規則名稱
- 跨欄驗證邏輯需改寫為透過 `this.parent.{fieldName}` 存取關聯欄位值，不得直接讀取 DOM
- 錯誤訊息必須來自 JSP 原始碼
- 無對應規則依 `TODO Templates` 處理
- `disabled` 欄位依 `TODO Templates` 標記
- **IF** 送出表單前（query / submit）**THEN** 直接移除 `valid.reset()`
- **IF** 清除表單值（clear）**THEN** `resetForm()`

**FORBIDDEN**
- 禁止新增 JSP 原始碼中不存在的驗證規則
- 禁止自行推測或撰寫錯誤訊息
- 禁止修改 CSS class 對應的驗證邏輯
- 禁止使用 `addMethod`
- 禁止 `import *`

---

## CSS Class → Yup Mapping

| CSS class | 錯誤訊息 | Yup 對應 |
|---|---|---|
| `required` | 不可空白 | `string().required()` |
| `validate-number` | 請輸入有效數字格式 | `string().validateNumber()` |
| `validate-positive-number` | 請輸入有效正數 | `number().positive()` |
| `validate-integer` | 請輸入有效整數 | `number().integer()` |
| `validate-digits` | 請輸入有效正整數 | `number().positive().integer()` |
| `validate-positive` | 請輸入大於零之有效正整數 | `number().positive().integer().min(1)` |
| `validate-greater-than-zero` | 請輸入大於零之有效數字格式 | `number().moreThan(0)` |
| `validate-positive-integer` | 請輸入大於零之有效整數 | `number().positive().integer()` |
| `validate-alpha` | 請輸入英文字母 | `string().validateAlpha()` |
| `validate-alphanum` | 請輸入有效文數字 | `string().matches(/^[\w\u4e00-\u9fa5]+$/, '請輸入有效文數字')` |
| `validate-date` | 請輸入有效日期格式 | `string().validateDate()` |
| `validate-date-db` | 有效日期格式為: YYYY-MM-DD | `string().validateDateDb()` |
| `validate-email` | 請輸入有效電子郵件地址格式 | `string().email()` |
| `validate-url` | 請輸入有效網址 | `string().url()` |
| `validate-selection` | 請選擇 | `string().required()` |
| `validate-ROCDate` | 請輸入正確的民國日期格式 | `string().validateROCDate()` |
| `validate-ROCDate-Interval` | 日期起迄有誤 | 起日：`string().validateROCDateMax('endField')` 迄日：`string().validateROCDateMin('startField')` |
| `validate-Date-Interval` | 日期起迄有誤 | 起日：`string().validateROCDateMax('endField')` 迄日：`string().validateROCDateMin('startField')` |
| `validate-DateYM` | 請輸入正確之西元年月格式 | `string().validateDateYM()` |
| `validate-ROCDateYM` | 請輸入正確之民國年月格式 | `string().validateROCDateYM()` |
| `checkInputLength` | 輸入值超出長度限制 | `string().max(maxLength)` |
| `checkROCID` | 身份證字號格式錯誤 | `string().validatorROCID()` |
| `checkROCARC` | 居留證號碼格式錯誤 | `string().validatorResidentID()` |
| `validate-one-required` | 請先選擇 | 見 TODO Templates |
| `validate-currency-dollar` | 請輸入有效金額 | 見 TODO Templates |
| `checkUniSN` | 統一編號格式有誤 | 見 TODO Templates |
| `hasFullType` | 不可輸入半型文字 | 見 TODO Templates |
| `hasHalfType` | 不可輸入全型文字 | 見 TODO Templates |
| `checkROCPassport` | 護照號碼格式錯誤 | 見 TODO Templates |
| `checkID` | 證件格式錯誤 | 見 TODO Templates |

---

## TODO Templates

### 無對應 Yup 規則

```js
// TODO: {className} 無對應 Yup 規則，待人工實作
fieldName: string().test('{className}', '{JSP 原始錯誤訊息}', (v) => {
  console.warn('[TODO] {className} 驗證邏輯待實作')
  return true
})
```

### disabled 欄位

`validation.js` 自動跳過 `disabled` 欄位驗證，新技術棧無法還原此機制，需人工確認是否應納入 schema。

```js
const schema = object({
  // FIXME: 原 validation.js 自動跳過 disabled 欄位，新技術棧無法還原，需人工確認是否納入 schema
  fieldName: string(),
})
```

---

## VeeValidate Guidelines

### useForm 初始化

```js
import { useForm, useField } from 'vee-validate'
import { object, string, number } from 'yup'
import '@/assets/libs/CathayValidateRules.js'

const { errors, validate, setValues, resetForm } = useForm({
  validationSchema: object({ ... }),
  initialValues: { fieldName: '' }, // ⚠️ 必須設定所有欄位，否則進入頁面就顯示錯誤
  validateOnMount: false,           // ⚠️ 必須設定，防止頁面載入時觸發驗證
})
```

### useField 宣告

```js
// ORIGINAL_FIELD_NAME
const { value: fieldName } = useField('fieldName')
```

```vue
<q-input
  v-model="fieldName"
  dense outlined
  :error="!!errors.fieldName"
  :error-message="errors.fieldName"
/>
```

### .test() 寫法

原始 JSP 跨欄驗證透過 `$F(node.name)` 直接讀取 DOM 值，翻新後必須改寫為透過 `this.parent` 存取同 schema 內其他欄位值。`.test()` 必須使用具名函式（非箭頭函式）才能存取 `this.parent`，共用驗證邏輯抽出為頁面內箭頭函式：

```js
// FIXME: 改寫自 {原始規則名稱}，需人工確認邏輯等價
const validateBetween = (val1, val2) => {
  if (!val1 || !val2) return true
  return Number(val2) >= Number(val1)
}

const schema = object({
  // FIELD_NAME1
  fieldName1: string(),
  // FIELD_NAME2：透過 this.parent.fieldName1 存取關聯欄位值
  fieldName2: string().test(
    'validateBetween',
    '迄值不得小於起值',
    function(val) {
      return validateBetween(this.parent.fieldName1, val)
    }
  ),
})
```

---

## Examples

### 單欄驗證

```jsp
<%-- JSP --%>
<input id="QUERY_ID" name="QUERY_ID" type="text"
  class="required checkInputLength" maxlength="10" />
```

```js
const schema = object({
  // QUERY_ID
  queryId: string().required('不可空白').max(10, '輸入值超出長度限制'),
})

// QUERY_ID
const { value: queryId } = useField('queryId')
```

### 跨欄驗證（起迄區間）

```jsp
<%-- JSP --%>
Validation.addAllThese([
  ['validateBetween', '迄值不得小於起值', function(v, node) {
    var v2 = parseInt(v, 10)
    var v1 = parseInt($F(node.name + '1'), 10)
    if (isNaN(v1) || isNaN(v2)) return true
    return v2 >= v1
  }]
])
<input id="BUILD_AGE1" name="BUILD_AGE" class="validate-digits validateBetween" />
<input id="BUILD_AGE2" name="BUILD_AGE" class="validate-digits validateBetween" />
```

```js
// FIXME: 改寫自 validateBetween，需人工確認邏輯等價
const validateBetween = (val1, val2) => {
  if (!val1 || !val2) return true
  return Number(val2) >= Number(val1)
}

const schema = object({
  // BUILD_AGE1
  buildAge1: string(),
  // BUILD_AGE2：透過 this.parent.buildAge1 存取關聯欄位值
  buildAge2: string().test(
    'validateBetween',
    '迄值不得小於起值',
    function(val) {
      return validateBetween(this.parent.buildAge1, val)
    }
  ),
})

// BUILD_AGE1
const { value: buildAge1 } = useField('buildAge1')
// BUILD_AGE2
const { value: buildAge2 } = useField('buildAge2')
```

### 多 Validation 實例（條件式 schema）

```jsp
<%-- JSP --%>
var valid1 = new Validation('form1', { ... }) // 擔保品查詢
var valid2 = new Validation('form1', { ... }) // 社區資料查詢
```

```js
// FIXME: 條件式 schema，需依顯示條件調整納入欄位，待人工確認
const schema = computed(() =>
  viewType.value === 'community'
    ? object({ caseName: string().required('不可空白'), city: string() })
    : object({ city: string().required('不可空白'), addrNo: string() })
)

const { errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { caseName: '', city: '', addrNo: '' },
  validateOnMount: false,
})
```
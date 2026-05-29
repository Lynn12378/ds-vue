# 表單驗證翻新指引

## Core Principles

**REQUIRED**：翻新必須依以下順序處理：

0. **Quasar Form**：所有表單元素必須翻新為 Quasar 元件，參照 [Quasar 元件規範](../instructions/quasar-components.md)

1. **validators**：
    - 識別頁面內所有 `Validation.add` / `Validation.addAllThese` 翻新為預定義 test 物件
    - `className` 命名轉為 camelCase
    - `$F('fieldName')` 跨欄取值改為 `this.parent['fieldName']`
    - **IF** 重構後驗證邏輯與原始不同 **THEN** 標注 `// FIXME：原始語法 － 需確認驗證行為是否等價`
    - `Validation.get(className).test(v)`：依 Class → Yup 對照表查找對應 Yup method，於 schema 內鏈式綁定；**IF** 無對應 **THEN** 標注 `// TODO: 原始語法 － 無對應驗證器`

2. **schema**：
    - 識別頁面內所有 `new Validation(formElement)`，並各自建立對應的 `{validName}Schema`
    - schemas 各自搜集 `formElement` 對應的 `<form id="formElement">` 內所有表單欄位，記錄各欄位使用的 className
    - 識別各 schema 動態綁定語法 `.define(className, inputs)`，將動態綁定改為靜態綁定並標注 `// FIXME: 原始語法 － 原為動態綁定，需確認驗證行為是否等價`，記錄 className 與對應欄位 name 的關係
    - 將每組 className 與欄位 name 的對應關係，查詢全局驗證器對照表及頁面預定義 validators：
        - **IF** 有 className 對應的驗證器 **THEN** 靜態綁定至 schema 對應欄位（name）
        - **ELSE** 無對應驗證器 **THEN** 標注 `// TODO: className：fieldName － 無對應驗證器` 於 schema 內部

3. **useForm**：
    - 依 `<form id="formElement">` 元素各自建立獨立的 `useForm()`
    - **IF** 同一個 `<form>` 對應多個 `new Validation()` **THEN** 仍只建立一個 `useForm()`，但必須以 `currentValid` + `computed()` 動態切換 `validationSchema`
    - `useForm` 必須設定 `initialValues`（所有欄位均需定義初始值）與 `validateOnMount: false`
    - 錯誤訊息統一從 `useForm` 的 `errors` 取得：
      - 單一元件（`q-input`、`q-select` 等）：在元件上綁定 `:error="!!errors.fieldName"` 與 `:error-message="errors.fieldName"`
      - `q-radio`、`q-checkbox` 群組：由外層 `q-field` 統一綁定 `:error` 與 `:error-message`，子元件不個別綁定

4. **useField**：
    - `useForm` 建立後，表單內每個欄位各自以 `const { value: fieldName } = useField('fieldName')` 宣告，name 必須與 `initialValues` key 一致
    - template 以 `v-model="fieldName"` 綁定

5. **送出與重置**：
    - **IF** useForm 對應多個驗證群組 **THEN** 送出前設定 `currentValid` 切換對應 schema 後再呼叫 `validate()`
    - **REQUIRED**：清空表單使用 `resetForm()`
    - **FORBIDDEN**：禁止在送出表單時呼叫 `resetForm()`
    - `.reset()` 出現於其他情境（頁面初始化、條件判斷等）時，依上述情境規則判斷

---

## Class → Yup 全局驗證器對照表

**REQUIRED**：必須使用鏈式寫法，禁止傳入錯誤訊息
**REQUIRED**：**IF** 無對應 **THEN** 標注 `// TODO: [className]`

| validation.js className | Yup method |
|---|---|
| `IsEmpty` | `number().skipEmptyStr()` / `date().skipEmptyStr()` |
| `required` | `string().required()` |
| `validate-number` | `string().validateNumber()` |
| `validate-positive-number` | `number().positive()` |
| `validate-integer` | `number().integer()` |
| `validate-digits` | `number().positive().integer()` |
| `validate-positive` | `number().positive()` |
| `validate-greater-than-zero` | `number().positive().integer().moreThan(0)` |
| `validate-alpha` | `string().validateAlpha()` |
| `validate-alphanum` | `string().validateAlphanum()` |
| `validate-date` | `string().validateDate()` |
| `validate-email` | `string().email()` |
| `validate-url` | `string().url()` |
| `validate-date-db` | `string().validateDateDb()` |
| `validate-positive-integer` | `number().positive().integer()` |
| `validate-ROCDate` | `string().validateROCDate()` |
| `validate-ROCDate-Interval` | 分別綁定起訖驗證，起始欄位：`string().validateROCDateMax('endField')`；結束欄位：`string().validateROCDateMin('startField')` |
| `validate-DateYM` | `string().validateDateYM()` |
| `validate-ROCDateYM` | `string().validateROCDateYM()` |
| `checkInputLength` | `string().max(maxLength)` |
| `checkROCID` | `string().validatorROCID()` |
| `checkROCARC` | `string().validatorResidentID()` |
| `validate-Date-Interval` | `// TODO` |
| `validate-currency-dollar` | `// TODO` |
| `validate-selection` | `// TODO` |
| `validate-one-required` | `// TODO` |
| `checkUniSN` | `// TODO` |
| `hasFullType` | `// TODO` |
| `hasHalfType` | `// TODO` |
| `checkROCPassport` | `// TODO` |
| `checkID` | `// TODO` |

---

## Example

### JSP

```jsp
Validation.addAllThese([
  ['validate-range', '結束值不得小於起始值', function(v, node) {
    var v1 = parseInt($F('START'), 10)
    var v2 = parseInt($F('END'), 10)
    if (isNaN(v1) || isNaN(v2)) return true
    return v2 >= v1
  }]
])

valid1 = new Validation('form1', {useTitles:true})
valid2 = new Validation('form1', {useTitles:true})
valid1.define('validate-range', { id: 'START' })
valid1.define('validate-range', { id: 'END' })

<form id="form1">
  <tr>
    <td><input id="NAME"  name="NAME"  class="required" /></td>
    <td><input id="START" name="START" class="validate-digits" /></td>
    <td><input id="END"   name="END"   class="validate-digits" /></td>
    <td><input id="EMAIL" name="EMAIL" class="required validate-email" /></td>
  </tr>
</form>
```

### Vue

```js
// Step 1: validators
const validators = {
  validateRange: {
    name: 'validateRange',
    message: '結束值不得小於起始值',
    test: function(v) {
      const v1 = parseInt(this.parent['START'], 10)
      const v2 = parseInt(this.parent['END'], 10)
      if (isNaN(v1) || isNaN(v2)) return true
      return v2 >= v1
    }
  }
}

// Step 2: schema
const valid1Schema = object({
  NAME:  string().required(),
  // FIXME: valid1.define('validateRange', { id: 'START' }) － 原為動態綁定，需確認驗證行為是否等價
  START: number().positive().integer().test(validators.validateRange),
  // FIXME: valid1.define('validateRange', { id: 'END' }) － 原為動態綁定，需確認驗證行為是否等價
  END:   number().positive().integer().test(validators.validateRange),
})

const valid2Schema = object({
  EMAIL: string().required().email(),
})

// Step 3: useForm
// 多組驗證群組才需要 currentValid 切換（valid1、valid2 皆對應同一個 form1，故只建立一個 useForm）
const currentValid = ref(null)

// FIXME: 新增 currentValid 切換驗證群組 － 需確認各 validate 動作對應的 valid 群組
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  return object()
})

const { errors, validate, resetForm } = useForm({
  validationSchema,
  initialValues: { NAME: '', START: 0, END: 0, EMAIL: '' },
  validateOnMount: false,
})

// Step 4: useField（useForm 建立後宣告）
const { value: NAME  } = useField('NAME')
const { value: START } = useField('START')
const { value: END   } = useField('END')
const { value: EMAIL } = useField('EMAIL')

// Step 5: 送出 / 重置
const doSubmit = async () => {
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return
}

const doQuery = async () => {
  currentValid.value = 'valid2'
  const { valid } = await validate()
  if (!valid) return
}

const doClear = () => resetForm()
```

```vue
<!-- template：錯誤訊息從 useForm 的 errors 取得 -->
<tr>
  <td>
    <q-field dense borderless>
      <q-input v-model="NAME" :error="!!errors.NAME" :error-message="errors.NAME" dense outlined />
    </q-field>
  </td>
  <td>
    <q-field dense borderless>
      <q-input v-model="START" :error="!!errors.START" :error-message="errors.START" dense outlined />
    </q-field>
  </td>
  <td>
    <q-field dense borderless>
      <q-input v-model="END" :error="!!errors.END" :error-message="errors.END" dense outlined />
    </q-field>
  </td>
  <td>
    <q-field dense borderless>
      <q-input v-model="EMAIL" :error="!!errors.EMAIL" :error-message="errors.EMAIL" dense outlined />
    </q-field>
  </td>
</tr>
```

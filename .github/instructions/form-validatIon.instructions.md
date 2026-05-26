# 表單驗證翻新指引

## Rules

### R1. 全局驗證器對照表

**REQUIRED**：`validation.js` 全局驗證器必須依照下表映射為 Yup schema method
**IF** 無對應 Yup method 的驗證器 **THEN** 於 schema 內部註解 `// TODO: [ValidationClassName] － 無對應 Yup method`。
**FORBIDDEN**：禁止自行推測錯誤訊息

| validation.js className | Yup method |
|---|---|
| `IsEmpty` | `number.skipEmptyStr()` or `date.skipEmptyStr()` |
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
| `validate-Date-Interval` | 必須改為跨欄綁定：起日：`date().skipEmptyStr().when('endField', { is: (v) => v, then: () => date().skipEmptyStr().max(yupRef('endField')) })`; 迄日：`date().skipEmptyStr().when('startField', { is: (v) => v, then: () => date().skipEmptyStr().min(yupRef('startField')) })` |
| `validate-ROCDate` | `string().validateROCDate()` |
| `validate-ROCDate-Interval` | 必須改為跨欄綁定：起日：`string().validateROCDateMax('endField')`; 迄日：`string().validateROCDateMin('startField')` |
| `validate-DateYM` | `string().validateDateYM()` |
| `validate-ROCDateYM` | `string().validateROCDateYM()` |
| `checkInputLength` | `string().max(maxLength)` |
| `checkROCID` | `string().validatorROCID()` |
| `checkROCARC` | `string().validatorResidentID()` |
| `validate-currency-dollar` | - |
| `validate-selection` | - |
| `validate-one-required` | - |
| `checkUniSN` | - |
| `hasFullType` | - |
| `hasHalfType` | - |
| `checkROCPassport` | - |
| `checkID` | - |

---

### R2. validation.js API 速查表

**REQUIRED**：下表 validation.js API 必須依照對應方式翻新為 vee-validate + yup 實作

| API | 翻新方式 |
|---|---|
| `Validation.add(className, error, testFn)` | `const validators = { [className]: { name, message, test } }` |
| `Validation.addAllThese([[className, error, testFn], ...])` | `const validators = { [className]: { name, message, test }, ... }` |
| `Validation.get(className).test(v)` | 依 R1 對照表查找對應 Yup method，無對應則 `// TODO: [className] － 無對應 Yup method` |
| `new Validation(formId, options)` | 依 R4 建立對應 schema，options 一律移除 |
| `valid.validate()` | `const { valid } = await validate()`，見 R6 |
| `valid.reset()` / `valid.clear()` | **IF** 目的為清空表單 **THEN** `resetForm()` **ELSE IF** 送出表單(submit) **THEN** 直接移除 |
| `valid.define(className, inputs)` | 將 `inputs` 內對應的欄位靜態綁定 `.test(validators[className])`，見 R4 |

---

### R3. validators 預定義 test 物件

**REQUIRED**：
- `Validation.add` 與 `Validation.addAllThese` 定義的驗證器，必須在 `useForm` 之前翻新為預定義 test 物件
- `name` 對應原始 `className`
- `message` 沿用原始 `error` 字串
- `test` 必須重構為 Yup 可行的驗證規則
- 跨欄取值：`$F('fieldName')` 必須改以 `this.parent['fieldName']` 取值
- 所有重構點必須標注 `// FIXME: 原始語法 → 翻新後語法 － 需確認行為等價`

```js
const validators = {
  // 單欄驗證
  [className]: {
    name: className,
    message: '原始 error 字串',
    test: (v) => { /* 重構後邏輯 */ }
  },
  // 跨欄驗證
  [className]: {
    name: className,
    message: '原始 error 字串',
    test: function(v) {
      const relatedValue = this.parent['fieldName'] // $F('fieldName')
      /* 重構後邏輯 */
    }
  }
}
```

---

### R4. Schema 定義

**REQUIRED**：
- 每個 `const validName = new Validation(formId)` 必須各自建立對應 schema
- schema 命名規則：`{validName}Schema`
- 依 `formId` 找出 HTML 中 `id="formId"` 的 `<form>` 元素，掃描其內所有表單欄位的靜態 className 驗證器，改為綁定對應的 Yup method
- **IF** `validName.define(className, inputs)` 中的 `validName` 對應當前 schema 的來源群組 **THEN** 將 `inputs` 內對應的欄位靜態綁定 `.test(validators[className])`
- 無任何驗證器的欄位不需列入 schema

---

### R5. useForm

**REQUIRED**：
- `validators` 必須在 `useForm` 之前建立（見 R3）
- `initialValues` 必須包含所有 schema 內有驗證規則的欄位，初始值依欄位型別設定為 `''` 或 `0`
- `validateOnMount: false` 必須設定，防止頁面載入時觸發驗證
- **IF** 頁面有多個 `new Validation()` 群組 **THEN** 建立 `currentValid` ref 與 `computed()` 切換 `validationSchema`，並標注 `// TODO: 確認各送出動作對應的 valid 群組切換條件`；`currentValid` 改變時 `computed()` 自動重新計算對應 schema
- **IF** 頁面只有一個 `new Validation()` 群組 **THEN** `validationSchema` 直接傳入對應 schema

```js
// 多個驗證群組
const currentValid = ref(null)

// TODO: 確認各送出動作對應的 valid 群組切換條件
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  return object()
})

const { errors, validate, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    fieldName: '',  // string
    fieldName2: 0,  // number
  },
  validateOnMount: false,
})

// 單一驗證群組
const { errors, validate, resetForm, setValues } = useForm({
  validationSchema: valid1Schema,
  initialValues: {
    fieldName: '',  // string
    fieldName2: 0,  // number
  },
  validateOnMount: false,
})
```

---

### R6. handleSubmit

**REQUIRED**：
- 原始 JSP 送出表單函式內，將 `valid.validate()` 翻新為以下結構：

```js
const { valid } = await validate()
if (!valid) return
// 通過後的處理
```

- **IF** 頁面有多個驗證群組 **THEN** 執行 `validate()` 前必須先設定 `currentValid` 切換對應 schema，`currentValid` 改變會觸發 R5 的 `computed()` 重新計算

```js
const onSubmit = async () => {
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}
```

**FORBIDDEN**：
- 禁止在送出表單時呼叫 `resetForm()`

---

## Steps

1. 識別頁面內所有 `Validation.add` / `Validation.addAllThese` → 依 R3 建立 `validators`
2. 識別頁面內所有 `new Validation()` 群組 → 依 R4 建立各群組對應 schema
3. 依 R5 建立 `useForm`
4. **IF** 多個驗證群組 **THEN** 建立 `currentValid` 與 `computed()` 切換 `validationSchema`，並標注 `// TODO`
5. 依 R6 翻新所有送出表單函式

---

## Examples

### 情境一：單一驗證群組 + 全局驗證器

```jsp
<%-- JSP --%>
valid1 = new Validation('form1', {useTitles:true})

<input id="NAME" name="NAME" class="required" />
<input id="AGE" name="AGE" class="validate-digits" />
```

```js
// Vue
const valid1Schema = object({
  NAME: string().required(),
  AGE: number().positive().integer(),
})

const { errors, validate, resetForm } = useForm({
  validationSchema: valid1Schema,
  initialValues: {
    NAME: '',
    AGE: 0,
  },
  validateOnMount: false,
})

const doSubmit = async () => {
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}
```

---

### 情境二：多個驗證群組 + computed 切換

```jsp
<%-- JSP --%>
valid1 = new Validation('form1', {useTitles:true})
valid2 = new Validation('form1', {useTitles:true})

<input id="EMAIL" name="EMAIL" class="required validate-email" />
<input id="PHONE" name="PHONE" class="required validate-digits" />
<input id="CASE_NAME" name="CASE_NAME" class="required" />
```

```js
// Vue

// valid1: ['EMAIL', 'PHONE']
const valid1Schema = object({
  EMAIL: string().required().email(),
  PHONE: number().positive().integer(),
})

// valid2: ['CASE_NAME']
const valid2Schema = object({
  CASE_NAME: string().required(),
})

const currentValid = ref(null)

// TODO: 確認各送出動作對應的 valid 群組切換條件
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  return object()
})

const { errors, validate, resetForm } = useForm({
  validationSchema,
  initialValues: {
    EMAIL: '',
    PHONE: 0,
    CASE_NAME: '',
  },
  validateOnMount: false,
})

const doQuery = async () => {
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}

const doCommunityQuery = async () => {
  currentValid.value = 'valid2'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}
```

---

### 情境三：頁面內部驗證器（單欄 + 跨欄）+ define()

```jsp
<%-- JSP --%>
Validation.addAllThese([
  ['validateRange', '結束值不得小於起始值', function(v, node) {
    var v2 = parseInt(v, 10)
    var v1 = parseInt($F('START'), 10)
    if (isNaN(v1) || isNaN(v2)) return true
    return v2 >= v1
  }],
  ['validateCityOrAddr', '地址與縣市別需擇一輸入', function(v, node) {
    if ($F('CITY') == '' && $F('ADDR') == '') return false
    return true
  }]
])

valid1 = new Validation('form1', {useTitles:true})
valid1.define('validateCityOrAddr', { id: 'CITY' })
valid1.define('validateCityOrAddr', { id: 'ADDR' })

<input id="START" name="START" class="validate-digits" />
<input id="END" name="END" class="validate-digits validateRange" />
<select id="CITY" name="CITY" />
<input id="ADDR" name="ADDR" />
```

```js
// Vue
const validators = {
  validateRange: {
    name: 'validateRange',
    message: '結束值不得小於起始值',
    test: function(v) {
      const v2 = parseInt(v, 10)
      // FIXME: $F('START') → this.parent['START'] － 需確認行為等價
      const relatedValue = parseInt(this.parent['START'], 10)
      if (isNaN(relatedValue) || isNaN(v2)) return true
      return v2 >= relatedValue
    }
  },
  validateCityOrAddr: {
    name: 'validateCityOrAddr',
    message: '地址與縣市別需擇一輸入',
    test: function(v) {
      // FIXME: $F('CITY') → this.parent['CITY']、$F('ADDR') → this.parent['ADDR'] － 需確認行為等價
      const city = this.parent['CITY']
      const addr = this.parent['ADDR']
      return city !== '' || addr !== ''
    }
  }
}

// valid1: ['START', 'END', 'CITY', 'ADDR']
const valid1Schema = object({
  START: number().positive().integer(),
  END: number().positive().integer().test(validators.validateRange),
  CITY: string().test(validators.validateCityOrAddr),  // define()
  ADDR: string().test(validators.validateCityOrAddr),  // define()
})

const { errors, validate, resetForm } = useForm({
  validationSchema: valid1Schema,
  initialValues: {
    START: 0,
    END: 0,
    CITY: '',
    ADDR: '',
  },
  validateOnMount: false,
})

const doSubmit = async () => {
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}
```
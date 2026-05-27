# 表單驗證翻新指引

## Core Principles

validation.js 透過 HTML 元素的 `class` 屬性識別並驅動驗證規則，翻新後改為 Yup schema 靜態定義驅動。

**REQUIRED**：翻新必須依以下順序處理：

1. **validators**：識別頁面內所有 `Validation.add` / `Validation.addAllThese`，翻新為預定義 test 物件
2. **schema**：識別頁面內所有 `new Validation()`，各自建立對應的 `object()` schema
3. **useForm**：依頁面 `<form>` 元素，各自建立對應的 `useForm()`，並綁定 validationSchema 與錯誤訊息
4. **表單送出與重置**：翻新所有表單送出與重置表單的函數結構

---

## R1. validation.js API 速查表

**REQUIRED**：下表為 validation.js API，必須依照對應翻新方式進行翻新：

| API | 翻新方式 |
|---|---|
| `Validation.add(className, error, testFn)` | 見 R3 |
| `Validation.addAllThese([[className, error, testFn], ...])` | 見 R3 |
| `Validation.get(className).test(v)` | 依 R2 對照表查找對應 Yup method；**IF** 無對應 **THEN** 於使用處標注 `// TODO: [className]` |
| `new Validation(formId, options)` | 見 R4，options 一律移除 |
| `valid.validate()` | 見 R6 |
| `valid.reset()` / `valid.clear()` | **IF** 目的為清空表單 **THEN** `resetForm()` **ELSE IF** 目的為送出表單 **THEN** 直接移除 reset |
| `valid.define(className, inputs)` | 見 R4 |

---

## R2. 全局驗證器對照表

**REQUIRED**：`validation.js` 全局驗證器必須依照下表映射為 Yup schema method，必須使用鏈式，且禁止傳入錯誤訊息。

**IF** 無對應 Yup method **THEN** 於 schema 內部標注 `// TODO: [ValidationClassName]`

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
| `validate-ROCDate` | `string().validateROCDate()` |
| `validate-ROCDate-Interval` | 必須改為跨欄綁定：起始欄位綁定：`string().validateROCDateMax('endField')`；結束欄位綁定：`string().validateROCDateMin('startField')` |
| `validate-DateYM` | `string().validateDateYM()` |
| `validate-ROCDateYM` | `string().validateROCDateYM()` |
| `checkInputLength` | `string().max(maxLength)` |
| `checkROCID` | `string().validatorROCID()` |
| `checkROCARC` | `string().validatorResidentID()` |
| `validate-Date-Interval` | - |
| `validate-currency-dollar` | - |
| `validate-selection` | - |
| `validate-one-required` | - |
| `checkUniSN` | - |
| `hasFullType` | - |
| `hasHalfType` | - |
| `checkROCPassport` | - |
| `checkID` | - |

---

## R3. 頁面預定義 validators

**REQUIRED**：`Validation.add` 與 `Validation.addAllThese` 定義的驗證器，必須翻新為預定義的 test 物件
**REQUIRED**：className 命名必須轉為 camelCase（ex：`validate-range` → `validateRange`）
**REQUIRED**：**IF** 原始 testFn 使用 Prototype.js 處理 DOM 操作 **THEN** 翻新為 Vue 原生或 `this.parent['fieldName']` 取值，並標注 `// FIXME` 註解說明對應關係與待確認事項

```jsp
Validation.add(className, error, testFn)
Validation.addAllThese([[className, error, testFn], ...])
```

```js
const validators = {
  // 單欄驗證器翻新
  [className]: {
    name: className,          // 對應原始 className（camelCase）
    message: error,           // 沿用原始 error 字串
    test: (v) => { /* 重構後邏輯 */ }
  },

  // 跨欄驗證器翻新（原始含 $F('fieldName') 取值）
  [className]: {
    name: className,
    message: error,
    test: function(v) {
      // FIXME: $F('fieldName') － 需確認行為是否等價
      const fieldName = this.parent['fieldName']
      /* 重構後邏輯 */
    }
  }
}
```

---

## R4. Schema 定義

**REQUIRED**：每個 `new Validation(formId)` 群組必須各自建立對應 schema，命名規則：`{validName}Schema`

**REQUIRED**：每個表單欄位的驗證規則（className）必須先查詢全局驗證器對照表（R2）及頁面預定義 validators（R3），再依結果綁定至 schema：
  **IF** 有 className 對應的驗證器 **THEN** 於 schema 綁定至對應欄位（name）
  **ELSE** 無對應驗證器 **THEN** 標注 `// TODO: className` 於 schema 內部

**REQUIRED：靜態綁定**：schema 必須依 `formId` 找出 `<form id="formId">` 內部所有表單欄位，將欄位 className 依上述規則綁定至對應欄位（name）

**REQUIRED：動態綁定**：**IF** schema 有動態綁定（`valid.define(className, inputs)`）**THEN** 必須將 className 對應的驗證器綁定至 schema 內對應欄位（name），並標注 `// FIXME: 原始語法 － 原為動態綁定，需確認驗證行為是否等價`

**FORBIDDEN**：禁止自行增加驗證規則或錯誤訊息

---

## R5. useForm 定義

**REQUIRED**：依頁面 `<form>` 元素建立對應 `useForm()`，每個 `<form>` 各自建立獨立的 `useForm()`
**REQUIRED**：查找該 `<form>` 對應的所有 `new Validation(formId)` 群組：
  **IF** 對應單一 `new Validation()` **THEN** `validationSchema` 直接傳入對應 schema
  **IF** 對應多個 `new Validation()` **THEN** 建立 `currentValid` 與 `computed()` 動態切換 `validationSchema`

```js
// 多個驗證群組
const currentValid = ref(null)

// FIXME: 新增 currentValid 切換驗證群組 － 需確認各 validate 動作對應的 valid 群組
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  return object()
})

const { errors, validate, resetForm, setValues } = useForm({
  validationSchema,
  validateOnMount: false,
})

// 單一驗證群組
const { errors, validate, resetForm, setValues } = useForm({
  validationSchema: valid1Schema,
  validateOnMount: false,
})
```

---

## R6. 表單送出與重置

**FORBIDDEN**：禁止在送出表單時呼叫 `resetForm()`

```js
// 情境一：單一驗證群組
const onSubmit = async () => {
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}

// 情境二：多個驗證群組，執行 validate() 前必須先設定 currentValid 切換對應 schema
const onSubmit = async () => {
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}
```

---

## Examples

```jsp
<%-- JSP --%>
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
  <input id="NAME" name="NAME" class="required" />
  <input id="START" name="START" class="validate-digits" />
  <input id="END" name="END" class="validate-digits" />
  <input id="EMAIL" name="EMAIL" class="required validate-email" />
</form>
```

```js
// Vue

// Step 1: validators
const validators = {
  validateRange: {
    name: 'validateRange',
    message: '結束值不得小於起始值',
    test: function(v) {
      // FIXME: parseInt($F('START'), 10) － 需確認行為是否等價
      const v1 = parseInt(this.parent['START'], 10)
      // FIXME: parseInt($F('END'), 10) － 需確認行為是否等價
      const v2 = parseInt(this.parent['END'], 10)
      if (isNaN(v1) || isNaN(v2)) return true
      return v2 >= v1
    }
  }
}

// Step 2: schema
// valid1: ['NAME', 'START', 'END']
const valid1Schema = object({
  NAME: string().required(),
  // FIXME: valid1.define('validateRange', { id: 'START' }) － 原為動態綁定，需確認驗證行為是否等價
  START: number().positive().integer().test(validators.validateRange),
  // FIXME: valid1.define('validateRange', { id: 'END' }) － 原為動態綁定，需確認驗證行為是否等價
  END: number().positive().integer().test(validators.validateRange),
})

// valid2: ['EMAIL']
const valid2Schema = object({
  EMAIL: string().required().email(),
})

// Step 3: useForm
const currentValid = ref(null)

// FIXME: 新增 currentValid 切換驗證群組 － 需確認各 validate 動作對應的 valid 群組
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  return object()
})

const { errors, validate, resetForm } = useForm({
  validationSchema,
  validateOnMount: false,
})

// Step 4: handleSubmit
const doSubmit = async () => {
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}

const doQuery = async () => {
  currentValid.value = 'valid2'
  const { valid } = await validate()
  if (!valid) return
  // 通過後的處理
}

const doClear = async () => {
  resetForm()
}
```

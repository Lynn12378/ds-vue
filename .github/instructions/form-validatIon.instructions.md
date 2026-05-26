# 表單驗證翻新指引

## Rules

### R1. 全局驗證器對照表

**REQUIRED**：`validation.js` 全局驗證器必須依照下表映射為 Yup schema method
**IF** 無對應 Yup method 的驗證器 **THEN** 於 schema 內部註解 `// TODO: [ValidationClassName] － 無對應 Yup method`。
**FORBIDDEN**： 全局驗證器已內建錯誤訊息，禁止自訂錯誤訊息(ex：`string.required('Custom error message')`)

| validation.js className | Yup method |
|---|---|
| `IsEmpty` | |
| `required` | |
| `validate-number` | |
| `validate-positive-number` | |
| `validate-integer` | |
| `validate-digits` | |
| `validate-positive` | |
| `validate-greater-than-zero` | |
| `validate-alpha` | |
| `validate-alphanum` | |
| `validate-date` | |
| `validate-email` | |
| `validate-url` | |
| `validate-date-db` | |
| `validate-currency-dollar` | |
| `validate-selection` | |
| `validate-one-required` | |
| `validate-positive-integer` | |
| `validate-Date-Interval` | |
| `validate-ROCDate` | |
| `validate-ROCDate-Interval` | |
| `validate-DateYM` | |
| `validate-ROCDateYM` | |
| `checkInputLength` | |
| `checkUniSN` | |
| `hasFullType` | |
| `hasHalfType` | |
| `checkROCID` | |
| `checkROCPassport` | |
| `checkROCARC` | |
| `checkID` | |

---

### R2. validation.js API

**REQUIRED**：下表 validation.js API 必須依照對應方式翻新為 vee-validate + yup 實作

| API | 翻新方式 |
|---|---|
| `Validation.add(className, error, testFn)` | `const validators = { [className]: { name, message, test } }` |
| `Validation.addAllThese([[className, error, testFn], ...])` | `const validators = { [className]: { name, message, test }, ... }` |
| `Validation.get(className).test(v)` | 依 R1 對照表查找對應 Yup method，無對應則 `// TODO: [className] － 無對應 Yup method` |
| `new Validation(formId, options)` | `const {validSchema} = yup.object({ ... })` |
| `valid.validate()` | `const { valid } = await validate()` |
| `valid.reset()`/ `valid.clear()` | **IF** 目的為清空表單 **THEN** `resetForm()` **ELSE IF** 送出表單(submit) **THEN** 直接移除 |
| `valid.define(className, inputs)` | `fieldName: yup.string().test(validators[className])` |

---

### R3. validators 預定義 test 物件

**REQUIRED**：
- `Validation.add` 與 `Validation.addAllThese` 定義的驗證器，必須在 `useForm` 之前翻新為預定義 test 物件
- `name` 對應原始 `className`
- `message` 沿用原始 `error` 字串
- `test` 必須重構為 Yup 可行的驗證規則
- 跨欄取值：`$F('fieldName')` → `this.parent['fieldName']`
- 重構的邏輯必須標注 `// FIXME: 原始語法 → 翻新後語法 － 需確認行為等價`

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


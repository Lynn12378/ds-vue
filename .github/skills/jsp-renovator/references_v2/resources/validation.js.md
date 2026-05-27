# `jsp_CM/validation.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/validation.js`
- 目標：欄位驗證、錯誤訊息呈現、送出前檢核
- 對應模組：
  - `src/assets/utils/validator.js`
  - `src/components/common/custom-input/CustomInput.vue`
  - `src/components/common/custom-select/CustomSelect.vue`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `new Validation(formId, options)` | 以 `rules` + `validator.js` 函式重建驗證流程 | `ONE_TO_ONE_REPLACE` | 不再依賴全局 Validation instance |
| `new Validator(...)` | 改為 `createRule(validatorFn, message)` 或自訂 rule | `ONE_TO_ONE_REPLACE` | 失敗回傳訊息字串 |
| `validation.validate()` | submit handler 執行規則並阻擋送出 | `ONE_TO_ONE_REPLACE` | 驗證失敗不得送 API |
| 日期/證號等特定檢核 | 使用 `isRocDate/isAdDate/checkROCID/...` | `ONE_TO_ONE_REPLACE` | 沿用既有算法 |
| `advice`/`errorDiv` DOM 操作 | 改為元件 `error` + `error-message` | `DIRECT_REMOVE` | 不直接操作 DOM class |

## 建議改寫骨架
```js
import { createRule, isRequired, isRocDate } from '@/assets/utils/validator.js'

const rocDateRules = [
  createRule(isRequired, '請輸入日期'),
  createRule(v => isRocDate(v, false, false), '日期格式錯誤')
]
```

```vue
<q-input
  v-model="form.applyDate"
  :rules="rocDateRules"
  :error="!!errors.applyDate"
  :error-message="errors.applyDate"
/>
```

## 契約要求
- 舊版「必填先檢核、格式次檢核」順序需保留。
- 舊版多欄位交叉驗證（例如起迄日）需保留同等邏輯。
- 舊版驗證錯誤訊息內容可調整文案，但不可改變觸發條件。

## 直接移除清單
- 在 `onblur/onkeyup` 中直接插入錯誤 `<span>`。
- 全域 `Validation.advice` 容器操作。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `useLegacyValidationAdapter(schema)`，輸出 `rulesMap` 與 `validateAll()`，先覆蓋關鍵欄位再逐步替換。

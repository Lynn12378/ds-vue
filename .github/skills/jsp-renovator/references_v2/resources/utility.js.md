# `jsp_CM/utility.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/utility.js`
- 目標：字串/數值格式化、提交防重複、按鈕狀態與覆蓋層
- 對應模組：
  - `src/assets/utils/legacy/utility.js`
  - `src/composables/useLoadingTask.js`
  - `src/assets/libs/customAxios/index.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `submitToUpper(...)` | `submitToUpper(...)`（同名） | `ONE_TO_ONE_REPLACE` | EMAIL 欄位不轉大寫規則保留 |
| `MoneyFormat(...)` / `DateFormat(...)` / `formatCurrency(...)` | `legacy/utility.js` 同名函式 | `ONE_TO_ONE_REPLACE` | 格式化輸出契約不變 |
| `replaceFullSpace/trimSpace(...)` | `replaceFullSpace/trimSpace(...)` | `ONE_TO_ONE_REPLACE` | 全形空白清理規則保留 |
| `submitOnce(...)` / `showCoverPage(...)` | `runWithLoading(asyncTask)` + local `isSubmitting` | `ONE_TO_ONE_REPLACE` | 防重送與 loading 行為保留 |
| `disableButton/enableButton` | 元件 `:disable` 綁定 reactive 狀態 | `ONE_TO_ONE_REPLACE` | 不再直接操作 DOM disabled |
| 覆寫 `window.open`、`form.submit` 注入 eBAF 參數 | 移除 legacy 覆寫，改由 `customAxios` request headers 注入 | `DIRECT_REMOVE` | 不可保留全局 monkey patch |

## 提交防重複建議
```js
import { ref } from 'vue'
import { useLoadingTask } from '@/composables/useLoadingTask.js'

const isSubmitting = ref(false)
const { runWithLoading } = useLoadingTask()

async function onSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await runWithLoading(async () => {
      await saveApi(formModel)
    })
  } finally {
    isSubmitting.value = false
  }
}
```

## 直接移除清單
- legacy iframe/parent frame 操作工具。
- 直接改寫全域 submit/open 行為的初始化碼。
- 依 id 字串在 DOM 上找按鈕後 setAttribute 的流程。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `legacyUtilityFacade`，只保留純函式工具，不保留 DOM side effect。

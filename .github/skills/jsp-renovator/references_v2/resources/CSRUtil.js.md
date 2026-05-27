# `jsp_CM/CSRUtil.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/CSRUtil.js`
- 目標：回應判斷、格式化、遮罩、Ajax/Loading 封裝、連結回跳
- 對應模組：
  - `src/assets/utils/legacy/CSRUtil.js`
  - `src/assets/libs/customAxios/index.js`
  - `src/composables/useUiState.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `CSRUtil.getReturnMessage(resp)` | `getReturnMessage(resp)` | `ONE_TO_ONE_REPLACE` | 回傳 `ErrMsg` 區塊 |
| `CSRUtil.isSuccess(resp)` | `isSuccess(resp)` | `ONE_TO_ONE_REPLACE` | `returnCode === 0` 規則不變 |
| `CSRUtil.$fmt(v, pattern, isInput)` | `$fmt(v, pattern, isInput)` | `ONE_TO_ONE_REPLACE` | 數字格式化契約不變 |
| `Date.toInputROC/Date.toROC` | `toInputROC/toROC` | `ONE_TO_ONE_REPLACE` | ROC 日期字串格式不變 |
| `CSRUtil.maskHandler.*` | `maskHandler.*` | `ONE_TO_ONE_REPLACE` | 遮蔽規則保留 |
| `CSRUtil.pressNumber/upNumber/getNumber` | 同名函式 | `ONE_TO_ONE_REPLACE` | 輸入限制規則不變 |
| `CSRUtil.AjaxHandler...` | `customAxios` + runtime hooks | `ONE_TO_ONE_REPLACE` | 攔截器統一處理 returnCode 與訊息 |
| `CSRUtil.createCoverPage(...)` | `useUiState().runWithLoading(...)` | `ONE_TO_ONE_REPLACE` | loading 顯示改為 store 狀態 |
| `CSRUtil.voToInputs/inputsToVo` | `reactive(formModel)` + 顯式 mapper | `WRAP_AND_KEEP_BLACKBOX` | 欄位鍵名必須保留 |
| `CSRUtil.linkTo/linkBack/getLP_JSON/clearLP_JSON` | Vue Router + `saveQuerySnapshot/restoreQuerySnapshot` | `WRAP_AND_KEEP_BLACKBOX` | 回跳資料結構維持既有 key |
| `hasInclude_jQuery/hasInclude_Prototype` | 直接移除 | `DIRECT_REMOVE` | v2 不依賴 jQuery/Prototype |

## AjaxHandler 建議改寫
```js
import customAxios from '@/assets/libs/customAxios/index.js'

const resp = await customAxios.post('/api/query', payload)
// 成功時已通過 returnCode 檢查
```

## vo/input 雙向建議改寫
```js
function mapVoToForm(vo, formModel) {
  Object.keys(formModel).forEach(key => {
    formModel[key] = vo?.[key] ?? ''
  })
}

function mapFormToVo(formModel) {
  return { ...formModel }
}
```

## 直接移除清單
- 依 Prototype/jQuery Ajax.Responders 註冊全局 callback。
- 直接操作 DOM 建立遮罩層或 loading GIF。
- 依 `window.top` 取值並直接寫 sessionStorage 的隱式 side effect。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `legacyCsrUtilAdapter`，僅保留必要入口：
  - `ajax(request)`
  - `toForm(vo)`
  - `toVo(form)`
  - `linkBack(state)`

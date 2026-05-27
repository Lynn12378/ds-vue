# `jsp_CM/PageUI.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/PageUI.js`
- 目標：頁面區塊建構、按鈕啟用規則、內容值同步
- 對應模組：
  - `src/assets/utils/legacy/pageUiPure.js`
  - `src/components/common/data-panel/CustomDataPanel.vue`
  - `src/components/common/search-form/CustomSearchForm.vue`
  - `src/components/common/data-table/CustomDataTable.vue`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `new PageUI(...)` | 以 SFC 組合頁面，不再建立全局 PageUI instance | `ONE_TO_ONE_REPLACE` | Page 生命週期改由 Vue 控制 |
| `createContent(config)`（`noHeader/noContent/headerInTop/colsInTable`） | 使用 `resolveContentMode` + `buildDefaultColumnProps` 決定版型 | `ONE_TO_ONE_REPLACE` | 保留版型語意，不保留 DOM 建構碼 |
| `setButtonsEnable(buttonIds, enableArray, skipCheckMap)` | `resolveButtonDisabledMap(...)` + `:disable` | `ONE_TO_ONE_REPLACE` | 按鈕 id 對應規則必須一致 |
| `setContentValues/getContentValues` | 以 `reactive(formModel)` + `v-model` 維護 | `ONE_TO_ONE_REPLACE` | 欄位 key 不改名 |
| `commit/rollback` | `useSnapshot().commitSnapshot/rollbackSnapshot` | `ONE_TO_ONE_REPLACE` | 還原點由快照決定 |
| `addOptions/removeOptions/setOption` | options 陣列 state + `q-select` | `ONE_TO_ONE_REPLACE` | value/label 契約不變 |
| `addChecks/setCheck/getChecks` | `q-checkbox`/`q-radio` + array/string model | `ONE_TO_ONE_REPLACE` | 多選序列化規則不可改 |

## 建議改寫骨架
```js
import { reactive, computed } from 'vue'
import pageUiPure from '@/assets/utils/legacy/pageUiPure.js'

const formModel = reactive({})
const buttonIds = ['queryBtn', 'saveBtn', 'resetBtn']

const disabledMap = computed(() =>
  pageUiPure.resolveButtonDisabledMap(buttonIds, 'queryBtn,resetBtn', {})
)
```

## 直接移除清單
- `document.createElement(...)` 動態建立 page header/content table。
- 以 id 字串在 DOM 中搜尋 input 再賦值。
- 透過 inline JS 字串綁定事件（例如 `onclick="..."`）。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `useLegacyPageUiAdapter(config)`，只輸出：
  - `layoutMode`
  - `columnProps`
  - `disabledMap`
- 禁止：在 adapter 內重建 DOM。

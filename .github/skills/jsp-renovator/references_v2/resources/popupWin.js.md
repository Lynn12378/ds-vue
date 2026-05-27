# `jsp_CM/popupWin.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/popupWin.js`
- 目標：彈窗開啟、回傳、關閉、window.open 行為
- 對應模組：
  - `src/composables/usePopupWin.js`
  - `src/service/popupWinFacade.js`
  - `src/components/common/popup/PopupWinDialog.vue`
  - `src/service/legacyFacadeService.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `popupWin.popup(...)` | 呼叫 `getPopupWinFacade().popup(...)` | `WRAP_AND_KEEP_BLACKBOX` | 保留舊簽章與 config 物件雙模式 |
| `popupWin.fullPopup(...)` | `getPopupWinFacade().fullPopup(...)` | `WRAP_AND_KEEP_BLACKBOX` | 保留全螢幕語意 |
| `popupWin.close()` | `getPopupWinFacade().close()` | `WRAP_AND_KEEP_BLACKBOX` | 關閉目前 popup |
| `popupWin.back(...)` | `getPopupWinFacade().back(...)` | `WRAP_AND_KEEP_BLACKBOX` | 保留 callback 回傳參數順序 |
| 指派 `popupWin.callbackHandler = fn` / `callbackProxy = fn` | facade property setter | `WRAP_AND_KEEP_BLACKBOX` | 必須維持可被覆寫 |
| `popupWin.windowOpen(url, opts)` | `getPopupWinFacade().windowOpen(url, opts)` | `ONE_TO_ONE_REPLACE` | 保留 POST hidden form 行為 |
| `createPopupLink/createPopupButton/...` | 改為 Vue template `q-btn/@click` | `DIRECT_REMOVE` | 不再建立原生 DOM element |
| `changeTopScrollHeight/rollBackTopScrollHeight` | 不實作業務邏輯，保留空介面或移除呼叫 | `DIRECT_REMOVE` | 此功能在 v2 無必要 |

## 建議改寫
```js
import { getPopupWinFacade } from '@/service/popupWinFacade.js'

const popupWin = getPopupWinFacade()

popupWin.popup({
  src: '/demo/popup-content',
  width: 900,
  height: 600,
  parameters: { policyNo: 'P123' },
  cb: payload => handlePopupReturn(payload)
})
```

## 全局相容策略
- 若舊碼仍直接呼叫 `window.popupWin`，必須確保 app 啟動時執行 `initPopupWinFacade()`。
- 翻新單一 JSP 時，若頁面只用到 `popup/fullPopup/close/back`，可不改呼叫點，視為相容模式。

## 直接移除清單
- 把 `createPopupLink()` 產生的 `<a>` 節點 append 到 DOM 的流程。
- 在字串 HTML 中嵌入 `javascript:popupWin...`。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：若命中罕見 legacy 參數組合，先在 facade 補 `normalizePopupConfig` 映射，不改頁面業務呼叫。

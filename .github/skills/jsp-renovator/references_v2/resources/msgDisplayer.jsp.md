# `jsp_CM/msgDisplayer.jsp` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/msgDisplayer.jsp`
- 目標：訊息彙整、通知列、警示視窗
- 對應模組：
  - `src/components/BaseLayout.vue`
  - `src/stores/messageStore.js`
  - `src/composables/useMessageCenter.js`
  - `src/assets/utils/common.js`
  - `src/assets/utils/legacy/msgDisplayer.js`

## Pattern 對照（first match wins）
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `<%@ include file="/html/CM/msgDisplayer.jsp" %>` 且未呼叫任何訊息函式 | 移除 include | `DIRECT_REMOVE` | `BaseLayout` 已全局處理訊息渲染 |
| `displayMessage(xxx)`（底部訊息條） | `pushMessage(buildBottomNotifyPayload(...))` | `ONE_TO_ONE_REPLACE` | 保留原顯示文字與等級 |
| `alertMessages(...)` 或 legacy alert 陣列 | `buildLegacyAlertMessage(...)` 後送入 `pushMessage` 或 dialog | `ONE_TO_ONE_REPLACE` | 保留多訊息合併順序 |
| `getMsgBoard()` + 操作 `innerHTML` | 改為 message store 狀態更新 | `ONE_TO_ONE_REPLACE` | 不再直接操作 DOM |
| click 後清除底部訊息（例如按鈕送出後清空） | 使用 `shouldClearBottomMsgByTargetType` 判斷後 `clearBottomMessage` | `ONE_TO_ONE_REPLACE` | 清除條件必須可測試、不可寫死 selector |

## 建議改寫骨架
```js
import { useMessageCenter } from '@/composables/useMessageCenter.js'
import {
  normalizeLegacyMessages,
  buildBottomNotifyPayload,
  buildLegacyAlertMessage
} from '@/assets/utils/common.js'

const { pushMessage } = useMessageCenter()

normalizeLegacyMessages(rawMsgs).forEach(item => {
  pushMessage(buildBottomNotifyPayload(item.message, item.level || 'info'))
})

const alertText = buildLegacyAlertMessage(rawAlertMessages)
if (alertText) {
  pushMessage({ level: 'error', message: alertText, notifyOnly: false })
}
```

## 直接移除清單
- `msgBoard` 節點建立/銷毀程式碼。
- 依 `document.onclick` 直接操作 `innerHTML` 清訊息。
- 以 `alert(...)` 直接拼字串顯示系統訊息。

## Fallback（無法命中既有 pattern）
- 分類：`FALLBACK_STUB`
- 作法：建立 `emitLegacyMessage(event)`，將 legacy payload 正規化後一律導入 `messageStore`。
- 必須保留：
  - 訊息等級（error/warn/info）
  - 訊息順序與去重規則

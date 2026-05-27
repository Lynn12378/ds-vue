# `jsp_CM/calendar.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/calendar.js`
- 目標：日期選取 UI、日期格式轉換、假日判斷
- 對應模組：
  - `src/components/common/custom-date/CustomDate.js`
  - `src/composables/useHolidayCalendar.js`
  - `src/service/holidayService.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `autoCreateDate(...)` | 改為 template 直接放 `CustomDate` | `ONE_TO_ONE_REPLACE` | 不再由 JS 動態插 DOM |
| `getCalendar(...)` / `getCalendarFor(...)` | 以 `q-popup-proxy` 開啟 `CustomDate` | `ONE_TO_ONE_REPLACE` | 事件來源改為 Vue click 綁定 |
| `pattern='ROC'` 或民國日期輸入 | `CustomDate` 設定 `datatype="ROC"` | `ONE_TO_ONE_REPLACE` | 由元件負責 ROC/西元轉換 |
| 呼叫假日判斷 | `useHolidayCalendar().isHolidayByCalendar(...)` | `ONE_TO_ONE_REPLACE` | 保留原 day code 判斷邏輯 |
| 透過 JS 建立 calendar icon 與 onclick | 改為 `q-icon` + slot append | `DIRECT_REMOVE` | 不保留字串事件 |

## 建議改寫骨架
```vue
<q-input v-model="form.rocDate" dense outlined clearable>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy>
        <CustomDate v-model="form.rocDate" datatype="ROC" minimal :today-btn="true" />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```

## 假日資料同步
```js
import { useHolidayCalendar } from '@/composables/useHolidayCalendar.js'

const { syncHolidayCalendar, isHolidayByCalendar } = useHolidayCalendar()
await syncHolidayCalendar({ year: 2026 })
const holiday = isHolidayByCalendar('20260101')
```

## 直接移除清單
- `document.write`/`innerHTML` 產生日曆表格。
- 直接操控 input `onblur/onfocus` 來重排日期字串。
- 依 iframe/window 座標計算 popup 位置。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `openLegacyCalendarBridge(fieldRef, options)`，內部仍委派到 `CustomDate`。
- 必須保留：
  - 原欄位值更新時機
  - 原日期字串格式（含分隔符）

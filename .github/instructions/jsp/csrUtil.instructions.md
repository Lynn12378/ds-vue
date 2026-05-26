---
description: JSP `CSRUtil.js` 舊用法遷移到 Vue3 新專案共用方法對照（僅遷移知識）
---

# CSRUtil 遷移對照

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| common 工具 | `import useCommon from '@/assets/utils/common.js'` | `src/assets/utils/common.js` |
| format 工具 | `import { numberAddComma, maskName, maskAddress } from '@/assets/utils/format.js'` | `src/assets/utils/format.js` |
| 日期運算 | `import dayjs from 'dayjs'` | `dayjs` |

---

## API 轉換對照

| 舊 CSRUtil API | 新語法 | 引用路徑 |
|---|---|---|
| `CSRUtil.checkROCID(id)` | `useCommon().checkROCID(id)` | `src/assets/utils/common.js` |
| `CSRUtil.checkROCARC(id)` | `useCommon().checkROCARC(id)` | `src/assets/utils/common.js` |
| `CSRUtil.checkUniSN(no)` | `useCommon().checkUniSN(no)` | `src/assets/utils/common.js` |
| `Date.toROC(date)` / `Date.toInputROC(date)` | `useCommon().tranCEorROCDate(date, 'rocDate')` | `src/assets/utils/common.js` |
| `CSRUtil.parseDate(str)` | `dayjs(str, 'YYYY-MM-DD')` | `dayjs` |
| `CSRUtil.dateRange(d1, d2)` | `dayjs(d2).diff(dayjs(d1), 'day')` | `dayjs` |
| `CSRUtil.round(val, scale)` | `Math.round(val * 10 ** scale) / 10 ** scale` | - |
| `CSRUtil.$fmt(v, pattern)` | `numberAddComma(v)` | `src/assets/utils/format.js` |
| `CSRUtil.maskHandler.getMaskName(v)` | `maskName(v)` 或 `useCommon().getMaskName(v)` | `src/assets/utils/format.js` / `src/assets/utils/common.js` |
| `CSRUtil.maskHandler.getMaskAddress(v)` | `maskAddress(v)` | `src/assets/utils/format.js` |
| `CSRUtil.getNumber(v)` | `Number(String(v ?? '').replace(/,/g, '')) || 0` | - |
| `CSRUtil.mapToSelectOptions(...)` / `listToSelectOptions(...)` | `q-select :options="options"` | - |
| `CSRUtil.isSuccess(resp)` | `resp?.ErrMsg?.returnCode === 0` | - |

---

## 無對應 API

以下 API 無既有共用方法可映射：

- `CSRUtil.hasInclude_jQuery`
- `CSRUtil.hasInclude_Prototype`
- `CSRUtil.isOnProgress`
- `CSRUtil.enableSessionStorage`
- `CSRUtil._is_LPJSON_at_top_worked`
- `CSRUtil.exportXls(...)`

```js
// TODO: [CSRUtil API] 無既有共用方法對應，禁止新增共用方法，待人工評估是否需要補共用方法或直接頁面內實作
```

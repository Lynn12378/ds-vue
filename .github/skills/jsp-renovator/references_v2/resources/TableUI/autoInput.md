# `TableUI` 子章節：autoInput（欄位內嵌輸入元件）

## 識別 pattern
- `column[].input = { type, action, disableRule, readOnlyRule, ... }`

## 核心規則
1. `input` 欄位一律改為 `body-cell-{name}` slot。
2. `props.row[field]` 為唯一資料來源，不可再同步隱藏欄位。
3. `input.action` 轉為 `@update:model-value` 事件。
4. `disableRule/readOnlyRule` 轉為 `:disable/:readonly`，參數固定傳 `props.row`。
5. 欄位同時有 `groupKey` 時，slot 必須檢查 `!props.skip`。

## type 映射表
| legacy `input.type` | v2 實作 | 分類 |
| --- | --- | --- |
| `text` | `q-input` | `ONE_TO_ONE_REPLACE` |
| `number` | `q-input type="number"` + `v-model.number` | `ONE_TO_ONE_REPLACE` |
| `date` | `q-input` + `q-popup-proxy` + `CustomDate` | `ONE_TO_ONE_REPLACE` |
| `rocdate` | `CustomDate` 並設定 `datatype="ROC"` | `ONE_TO_ONE_REPLACE` |
| `textarea` | `q-input type="textarea"` | `ONE_TO_ONE_REPLACE` |
| `select` | `q-select` | `ONE_TO_ONE_REPLACE` |
| `checkbox` | `q-checkbox` 或多選群組 | `ONE_TO_ONE_REPLACE` |
| `radio` | `q-radio` 群組 | `ONE_TO_ONE_REPLACE` |
| `button` | `q-btn` | `ONE_TO_ONE_REPLACE` |
| `show` | 純文字 slot（可加截斷） | `ONE_TO_ONE_REPLACE` |

## 樣板
```vue
<template #body-cell-AMT="props">
  <td v-if="!props.skip" :rowspan="props.rowspan ?? 1">
    <q-input
      v-model.number="props.row.AMT"
      type="number"
      dense
      outlined
      :disable="disableRule(props.row)"
      @update:model-value="val => onAmtChanged(props.row, val)"
    />
  </td>
</template>
```

## 直接移除
- legacy `easyEdit` 以 jQuery 或 DOM 替換 input/show 區塊的程式。
- `onclick` 字串事件注入（改為 Vue 事件綁定）。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `renderLegacyCellInput(inputConfig, row)` mapping 函式，先支援常見 type，再逐步補齊罕見 type。

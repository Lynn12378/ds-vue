# `TableUI` 子章節：群組合併（groupKey）

## 識別 pattern
- `column[].groupKey = ...`

## 翻新規則
| legacy 設定 | v2 設定 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `column[].groupKey`（數字/陣列） | `groupKeys: string[]` | `ONE_TO_ONE_REPLACE` | 轉為需同時比較的欄位 name 清單 |
| 依 groupKey 合併列顯示 | `CustomTable` 以 `rowspan/skip` 供 slot 使用 | `ONE_TO_ONE_REPLACE` | slot 必須判斷 `!props.skip` 才可輸出 `<td>` |

## 必要實作
```vue
<CustomTable
  :columns="columns"
  :rows="rows"
  :group-keys="['DEPT', 'SECTION']"
>
  <template #body-cell-DEPT="props">
    <td v-if="!props.skip" :rowspan="props.rowspan ?? 1">
      {{ props.value }}
    </td>
  </template>
</CustomTable>
```

## 禁止事項
- 已有 `group-keys` 時，slot 內移除 `v-if="!props.skip"`。
- 用手動 index 比對重算 `rowspan`（避免與元件內建演算法衝突）。

## 與 autoInput 並存
若同一欄位同時命中 `groupKey` 與 `input`：
- 仍保留 `!props.skip` 條件。
- 在可輸出的 `<td>` 內再放 `q-input`/`q-select`。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `resolveLegacyGroupKeys(columnConfig)`，將複雜 group level 規則轉為欄位清單。

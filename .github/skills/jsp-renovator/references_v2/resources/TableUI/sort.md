# `TableUI` 子章節：排序（sortRule / sortKey）

## 識別 pattern
- `column[].sortRule`
- `column[].sortKey`

## 翻新規則
| legacy 設定 | v2 設定 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `sortRule: 'string'` | `sortable: true`（可不提供 comparator） | `ONE_TO_ONE_REPLACE` | 使用預設字串排序 |
| `sortRule: 'number'` | `sort: (a,b) => Number(a) - Number(b)` | `ONE_TO_ONE_REPLACE` | 非數值視為 0 |
| `sortRule: 'date'` | `sort: (a,b) => new Date(a) - new Date(b)` | `ONE_TO_ONE_REPLACE` | 日期字串需先正規化 |
| `sortRule: 'rocdate'` | 自訂 ROC comparator | `ONE_TO_ONE_REPLACE` | 必須先轉西元再比較 |
| `sortKey` 與顯示 key 不同 | `field` 取排序值、`format` 顯示原值 | `ONE_TO_ONE_REPLACE` | 不可把顯示值當排序值 |

## ROC 排序範例
```js
function rocToSortableNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length < 7) return 0
  const rocYear = parseInt(digits.slice(0, 3), 10)
  const year = rocYear + 1911
  const month = digits.slice(3, 5)
  const day = digits.slice(5, 7)
  return Number(`${year}${month}${day}`)
}

const column = {
  name: 'ROC_DATE',
  field: 'ROC_DATE',
  label: '民國日期',
  sortable: true,
  sort: (a, b) => rocToSortableNumber(a) - rocToSortableNumber(b)
}
```

## `sortKey` 分離範例
```js
const column = {
  name: 'NAME_DISPLAY',
  field: row => row.NAME_SORT,
  label: '姓名',
  sortable: true,
  format: (val, row) => row.NAME_DISPLAY
}
```

## 禁止事項
- 直接沿用 legacy 全局排序函式並操作 DOM。
- `sortKey` 存在時仍以畫面顯示字串排序。

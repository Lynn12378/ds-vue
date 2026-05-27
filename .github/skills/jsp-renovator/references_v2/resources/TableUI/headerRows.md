# `TableUI` 子章節：多層表頭（headerRows）

## 識別 pattern
- `config.split = [...]`
- `config.headerColumn = [...]`

兩者都翻新為 `headerRows`。

## 翻新規則
| legacy 設定 | v2 設定 | 分類 | 規則 |
| --- | --- | --- | --- |
| `split`（以 key 切行） | `headerRows: Array<Array<Cell>>` | `ONE_TO_ONE_REPLACE` | 每一列依切點重建，末列需含可對應欄位 |
| `headerColumn[].attrs.colSpan` | `cell.colspan` | `ONE_TO_ONE_REPLACE` | 數值必須保留 |
| `headerColumn[].attrs.rowSpan` | `cell.rowspan` | `ONE_TO_ONE_REPLACE` | 數值必須保留 |
| `headerColumn[].header` | `cell.label` | `ONE_TO_ONE_REPLACE` | 文案不改 |

`Cell` 物件格式：
- `label: string`（必填）
- `colspan?: number`
- `rowspan?: number`
- `field?: string`（可排序欄位才填）

## 強制一致性檢查
1. `columns` 仍需完整定義資料欄位；`headerRows` 只負責 header 外觀。
2. `headerRows` 最末列的 `field` 必須對應到 `columns[].name`。
3. 每列展開後總欄位數必須等於資料欄位數。

## 範例
```js
const columns = [
  { name: 'SEQ', field: 'SEQ', label: '序號' },
  { name: 'AMT', field: 'AMT', label: '金額' },
  { name: 'TAX', field: 'TAX', label: '稅額' }
]

const headerRows = [
  [
    { label: '序號', rowspan: 2, field: 'SEQ' },
    { label: '金額資訊', colspan: 2 }
  ],
  [
    { label: '金額', field: 'AMT' },
    { label: '稅額', field: 'TAX' }
  ]
]
```

## 直接移除
- 以 DOM 動態插入 `<tr>/<th>` 的 legacy 建構碼。

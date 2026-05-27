# TableUI/headerRows.md — 多列 Header 翻新指引

## 識別 Pattern

JSP 中以下兩種 config 均會產生多列 header，翻新方式相同：

```js
// Pattern A：split（依 key 切行）
new TableUI({
  column: [ ...allColumns ],
  split: ['KEY_A', 'KEY_C']   // KEY_A、KEY_C 為各行起始的欄位 key
})

// Pattern B：headerColumn（獨立定義 header 結構）
new TableUI({
  column: [ ...dataColumns ],
  headerColumn: [
    [ { header: '群組A', attrs: { colSpan: 2 } }, { header: '群組B', attrs: { colSpan: 3 } } ],
    [ { header: '欄1'  }, { header: '欄2' }, { header: '欄3' }, { header: '欄4' }, { header: '欄5' } ]
  ]
})
```

---

## 翻新方式

一律翻新為 `:header-rows` prop。

### `headerRows` 格式

`Array<Array<{ label, colspan?, rowspan?, field? }>>`

| 屬性 | 說明 | 預設 |
|---|---|---|
| `label` | 顯示文字 | （必填） |
| `colspan` | 水平合併欄數 | `1` |
| `rowspan` | 垂直合併列數 | `1` |
| `field` | 對應 `columns[].name`；有值時點擊該格可觸發排序 | `''`（不可排序） |

**REQUIRED**：
- `columns` 仍須完整定義所有資料欄位（`name`、`field`、`label` 等），`headerRows` 只描述視覺結構
- `headerRows` 末列每個有 `field` 的格子，其值必須存在於 `columns[].name`
- 各列的 `colspan` 加總必須與 `columns` 欄位總數一致

---

## 翻新範例

### Pattern A：`split`

`split` 陣列的每個 key 代表「該行的起始欄位」，各行包含從該起始 key 到下一個起始 key（不含）之間的所有欄位。

```js
// 原始
new TableUI({
  column: [
    { key: 'DEPT',   header: '部門' },  // 第一行起始
    { key: 'NAME',   header: '姓名' },
    { key: 'AMT',    header: '金額' },  // 第二行起始
    { key: 'REMARK', header: '備註' }
  ],
  split: ['DEPT', 'AMT']
  // 第一行：DEPT、NAME（從 DEPT 到 AMT 之前）
  // 第二行：AMT、REMARK（從 AMT 到結尾）
})

```vue
<!-- 翻新 -->
<script setup>
const columns = [
  { name: 'DEPT',   field: 'DEPT',   label: '部門' },
  { name: 'NAME',   field: 'NAME',   label: '姓名' },
  { name: 'AMT',    field: 'AMT',    label: '金額' },
  { name: 'REMARK', field: 'REMARK', label: '備註' }
]

const headerRows = [
  [
    { label: '部門', field: 'DEPT' },
    { label: '姓名', field: 'NAME' }
  ],
  [
    { label: '金額', field: 'AMT' },
    { label: '備註', field: 'REMARK' }
  ]
]
</script>

<template>
  <CustomTable :columns="columns" :rows="rows" :header-rows="headerRows" />
</template>
```

---

### Pattern B：`headerColumn`（含 colSpan）

```js
// 原始
new TableUI({
  column: [
    { key: 'SEQ',       header: '序號' },
    { key: 'NAME',      header: '姓名' },
    { key: 'SUB_AMT',  header: '小計' },
    { key: 'TOTAL_AMT', header: '合計' }
  ],
  headerColumn: [
    [
      { header: '基本資料', attrs: { colSpan: 2 } },
      { header: '金額資訊', attrs: { colSpan: 2 } }
    ],
    [
      { header: '序號' },
      { header: '姓名' },
      { header: '小計' },
      { header: '合計' }
    ]
  ]
})
```

```vue
<!-- 翻新 -->
<script setup>
const columns = [
  { name: 'SEQ',       field: 'SEQ',       label: '序號' },
  { name: 'NAME',      field: 'NAME',      label: '姓名' },
  { name: 'SUB_AMT',  field: 'SUB_AMT',  label: '小計' },
  { name: 'TOTAL_AMT', field: 'TOTAL_AMT', label: '合計' }
]

const headerRows = [
  [
    { label: '基本資料', colspan: 2 },
    { label: '金額資訊', colspan: 2 }
  ],
  [
    { label: '序號',  field: 'SEQ' },
    { label: '姓名',  field: 'NAME' },
    { label: '小計',  field: 'SUB_AMT' },
    { label: '合計',  field: 'TOTAL_AMT' }
  ]
]
</script>

<template>
  <CustomTable :columns="columns" :rows="rows" :header-rows="headerRows" />
</template>
```

---

### rowSpan 範例

```js
// 原始
headerColumn: [
  [
    { header: '序號', attrs: { rowSpan: 2 } },
    { header: '金額資訊', attrs: { colSpan: 2 } }
  ],
  [
    { header: '小計' },
    { header: '合計' }
  ]
]
```

```js
// 翻新
const headerRows = [
  [
    { label: '序號',    field: 'SEQ', rowspan: 2 },
    { label: '金額資訊', colspan: 2 }
  ],
  [
    { label: '小計', field: 'SUB_AMT' },
    { label: '合計', field: 'TOTAL_AMT' }
  ]
]
```
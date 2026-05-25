# JSP Renovation Analysis Report Template: {FileName}

> 複製本模板後，輸出至：`.github/ir/analysis/{FileName}-analysis.md`

## Report Meta

- FileName: `{FileName}`
- Bean_Name: `{Bean_Name}`
- Module: `{Module}`
- Source JSP: `{jsp}`

## Scope Boundary Confirmation

- [ ] 已僅以目標 JSP 內可見內容作為翻新依據
- [ ] 未引用其他頁面規格
- [ ] 未進行主動優化或行為簡化

## 表一：R2 翻新決策表

> 後續 Step 2 ~ Step 4 必須依此表執行。未列出項目禁止新增。

### 自訂資源

| 識別項目 | 翻新方式 | 依據 |
|---|---|---|
|  |  |  |

### 表單驗證

| 識別項目 | 翻新方式 | 依據 |
|---|---|---|
|  |  |  |

### UI 元件

| 識別項目 | 翻新方式 | 依據 |
|---|---|---|
|  |  |  |

### Server-side 資料

| 識別項目 | 翻新方式 | 依據 |
|---|---|---|
|  |  |  |

## 表二：Fallback 清單

> Step 2 必須依此表建立 composable。

| 資源名稱 | 原始方法 | Fallback 模式 |
|---|---|---|
|  |  |  |

## Risk / Unknowns

- [ ] 無
- [ ] 有，說明如下：
  - TODO:

## Step Gating

- [ ] Step 2 僅依表二建立 Fallback composables
- [ ] Step 3 僅執行 R1 直接翻新
- [ ] Step 4 僅執行表一列出項目

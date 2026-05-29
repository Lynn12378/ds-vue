---
name: jsp-renovator
description: 將單頁 Legacy JSP 翻新為 Vue 3 SFC
argument-hint: >
  jsp=<JSP 檔案路徑>
  skipCM=<是否跳過查詢「舊有自訂依賴」的翻新指引文件，預設為 false>
disable-model-invocation: true
user-invocable: true
---

# JSP Renovator

## Goals
### Primary
依照翻新指引將單頁 Legacy JSP 轉換為 Vue 3 SFC（Single File Component）。

### Secondary
- 將舊技術棧翻新為現代技術棧
- 依循翻新指引處理**直接翻新**、**直接移除**、**需查翻新指引**、**TODO** 四類項目
- 識別翻新指引未覆蓋的待翻新項目，建立 TODO 錨點以供後續處理

---

## Constraints
### Scope Boundaries
**REQUIRED**：翻新範圍限定於單頁 Legacy JSP
**REQUIRED**：翻新指引來源僅限與此 SKILL 同層的 `references/`
**REQUIRED**：產出必須符合與此 SKILL 同層的 `instructions/` 專案規範
**FORBIDDEN**：禁止自行推論舊有自訂依賴的內部邏輯
**FORBIDDEN**：禁止自行參照非轉換指引提供的外部檔案或資源（R2 等價技術棧知識內建於 SKILL，不在此限）
**FORBIDDEN**：禁止主動優化或簡化原始業務邏輯

### Technology Constraints
**核心框架**：Vue 3 (Composition API)
**語言**：JavaScript
**元件庫**：Quasar Framework
**狀態管理**：Pinia
**路由管理**：Vue Router
**表單驗證**：VeeValidate（Composition API）+ Yup
**HTTP 請求**：customAxios（`@/assets/plugins/customAxios.js`）
**日期處理**：Day.js

### Output Constraints
**Vue SFC**：`@/views/{Module}/{FileName}.vue`
**Route**：`@/router/router.js`

---

## Context Variables

- `{FileName}`：JSP 檔案名稱 － `{SystemCode(2)}` + `{Module(2)}`+ `{SubCode(4)}`，如：`DSMMSSSS`
- `{Bean_Name}`：JSP 對應的 Java 名稱 － `{SystemCode(2)}` + `{Module(2)}`+ `_` + `{SubCode(4)}`，如：`DSMM_SSSS`
- `{Module}`：JSP 模組名稱 － `{FileName}` 的第 3-4 字元，如：`MM`

---

## Rules

### R1：翻新指引識別
**REQUIRED**：依以下規則分析翻新項目對應的翻新指引來源：
  - **直接翻新**：業務邏輯可見、無隱藏依賴，且有等價技術棧可直接對應，直接翻新（見 R2）
  - **直接移除**：新專案不需要此機制，直接移除（見 R5）
  - **需查翻新指引**：無直接對應關係，或為舊有自訂依賴，必須查閱對應翻新指引文件後決策（見 R3、R4）
  - **TODO**：無翻新指引覆蓋，建立 TODO 錨點（見 R7）

---

### R2：直接翻新項目
**REQUIRED**：已有等價技術棧可直接翻新：

| 原始語法 | 翻新對應 |
|---|---|
| JSTL core | Vue template |
| Prototype.js、JQuery DOM 操作 | Vue 原生 |
| JQuery AJAX、Prototype.js Ajax、XMLHttpRequest | customAxios（**endpoint**：`dispatch/{Bean_Name}/{action}` → `/api/{Bean_Name}/{action}`） |
| inline Style、棄用 HTML 屬性 | Vue template + `:style` |
| `<form action="...">`、`window.location.href` | `router.push({ name })`（**route name**：`{FileName}`） |
| `${param.xxx}`、`request.getParameter('xxx')` | `route.query.xxx` |
| `<input type="hidden">` | `ref` |

---

### R3：需查翻新指引 — 無等價技術棧
**REQUIRED**：無直接對應技術棧，必須查閱對應翻新指引文件：

- **表單驗證**：[表單驗證翻新指引](references/form-validation.md)
  - 識別語法：`Validation.add`、`Validation.addAllThese`、`new Validation()`

- **Server-side 資料注入**：[Server-side 資料注入翻新指引](references/server-side.md)
  - 識別語法：`${data}`、`request.getAttribute('data')`、`session.getAttribute('data')`、`application.getAttribute('data')`、`<%=data%>`
  - **EXCEPTION**：**IF** `data` 來源為頁面內部宣告（`<c:set>`、`<c:forEach>` 迭代變數等）**THEN** 歸入 R2 直接翻新

---

### R4：需查翻新指引 — 舊有自訂依賴
**IF** `skipCM=true` **THEN** 跳過所有翻新指引文件，所有自訂依賴直接建立 TODO 錨點
**ELSE**：查閱舊有自訂依賴對應翻新指引文件，依對照表完成翻新決策：
  - **REQUIRED**：所有引用語法記錄路徑後移除；**EXCEPTION**：`<jsp:include>` 必須保留原佔位並標注 TODO
  - **REQUIRED**：依下列 pattern 查找對應翻新指引文件：

| 引用 pattern | 翻新指引文件路徑 |
|---|---|
| `<%@ taglib prefix="{prefix}">` | `references/tag/{prefix}.md` |
| `<script src="{fileName}">` | `references/js/{fileName}.js.md` |
| `<%@ include file="{fileName}" %>`、`<jsp:include page="{fileName}" />` | `references/jsp/{fileName}.jsp.md` |
| `<link rel="stylesheet" ...>` | 已於 main.js 統一處理，直接移除 |
| `<img src="{filePath}">` | TODO，後續人工處理；**EXCEPTION**：`calendar.gif` → `<q-icon name="event">` |

---

### R5：直接移除
**REQUIRED**：新專案不需要的機制，直接移除：
  - HTML Root & Metadata，ex：`<html>`, `<head>`, `<body>`, `<meta>`, `<title>`

---

### R6：決策分類
**REQUIRED**：依照翻新指引分析結果，將所有項目分為以下四類策略：
  - **直接移除**：語法在新架構下完全消失，不需任何替代或佔位。對照表中翻新對應欄為 `—`
  - **1:1 轉換**：單一原始語法 → 單一目標語法替換
  - **1:N 轉換**：單一依賴涉及多個資源協同轉換，需一併處理所有參與語法
  - **TODO**：暫未封裝、決策未定、或有替換方向但需人工實作。對照表中翻新對應欄為 `// TODO`

---

### R7：TODO 錨點規則
**REQUIRED**：依照自訂依賴的類型，建立對應的 TODO 錨點：

```vue
<!-- <jsp:include>：保留原佔位，於原始位置標注 TODO -->
<!-- TODO: `<jsp:include page="{fileName}" />` -->

<!-- Custom Tag：於原始位置標注 TODO -->
<!-- TODO: `<custom:tag ...>` -->

// region TODO
/** 外部方法：集中註解於檔案底部的 TODO region */
// TODO: someFunction(params)
const use{SomeFunction} = (params) => null

/** 外部類別：集中註解於檔案底部的 TODO region */
// TODO: new ClassName(params)
const use{ClassName} = (params) => {
  // TODO: ClassName.someProperty
  const someProperty = null
  // TODO: ClassName.someMethod()
  const someMethod = () => null
}
// endregion TODO
```

**FORBIDDEN**：禁止自行推論舊有自訂依賴的內部邏輯

---

## Workflow

### Phase 1: 翻新指引分析
#### Step 1：掃描文件
**REQUIRED**：依分析規則（R1–R5）掃描 JSP，識別所有項目的翻新來源類型
**IF** `skipCM=true` **THEN** 跳過所有自訂依賴翻新指引文件
**ELSE**：識別需查閱的翻新指引文件（R3、R4）

#### Step 2：建立決策紀錄
**REQUIRED**：查閱翻新指引後，依決策分類將所有項目分組記錄：

- **直接移除**：列出所有直接移除項目
- **1:1 轉換**：逐一列出原始呼叫與翻新對應
- **1:N 轉換**：列出每個群組的完整觸發語法組合及翻新後封裝元件與 props 對應
- **TODO**：列出所有無法自動翻新的項目與原因

---

### Phase 2: 翻新實作
#### Step 1：直接移除
**REQUIRED**：依 R5 及決策分類，移除所有「直接移除」項目

#### Step 2：1:1 轉換
**REQUIRED**：依決策紀錄，逐一完成所有 1:1 轉換

#### Step 3：1:N 轉換
**REQUIRED**：依決策紀錄，處理所有 1:N 群組轉換
**REQUIRED**：每個群組的所有觸發語法必須一併替換，不得遺漏

#### Step 4：TODO 錨點
**REQUIRED**：依 R7 規則，為所有 TODO 項目建立對應的 TODO 錨點

---

### Phase 3: 驗證與結論紀錄
#### Step 1：檢驗翻新結果
**REQUIRED**：驗證翻新結果，確保 Evaluation Checklist 中的項目皆符合要求
**IF** 有違規項目 **THEN** 根據違規類型回到對應的規則（R1–R7）進行修正
**ELSE** 建立 Vue SFC 並加入路由管理

#### Step 2：輸出翻新結果
**REQUIRED**：以結構化的表格或清單形式輸出翻新結果於對話視窗，包含：
  - 四類決策分組清單
  - 表單驗證群組 + 驗證欄位 + 驗證規則
  - Server-side 資料與 API response 賦值
  - TODO 錨點列表與對應的待處理項目描述

**FORBIDDEN**：禁止生成分析報告或任何輔助文件，所有輸出應直接呈現在對話視窗中

---

## Evaluation Checklist
### 輸出完整性
  - [ ] 產出 Vue SFC
  - [ ] 更新路由管理
  - [ ] Vue SFC 無語法錯誤
  - [ ] 翻新結果以結構化的表格或清單形式呈現於對話視窗

### 分析與決策
  - [ ] 所有翻新項目皆已依 R1 識別分類
  - [ ] R2 直接翻新項目皆已正確對應
    - [ ] API endpoint 已正確轉換
    - [ ] 路由跳轉已正確對應
  - [ ] R3 無等價技術棧項目皆已查閱對應翻新指引
  - [ ] R4 自訂依賴皆已查閱對應翻新指引（或 `skipCM=true` 時直接建立 TODO）
  - [ ] R5 所有「直接移除」項目皆已移除
  - [ ] R6 所有項目皆已依四類策略完成決策分組

### 翻新實作
  - [ ] 所有「直接移除」項目已先於 1:1 / 1:N 轉換處理
  - [ ] 1:N 群組轉換已先於 1:1 轉換處理
  - [ ] 所有 TODO 錨點皆保留原始語法作為追蹤依據
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
- 依循翻新指引處理**無等價技術棧**及**舊有自訂依賴（Custom Dependencies）**
- 識別翻新指引未覆蓋的待翻新項目，建立 TODO 錨點以供後續處理

---

## Constraints
### Scope Boundaries
**REQUIRED**：翻新範圍限定於單頁 Legacy JSP
**REQUIRED**：僅可使用與此 SKILL 同層的 `references/` 作為翻新指引文件的來源
**FORBIDDEN**：禁止自行推論舊有自訂依賴的內部邏輯
**FORBIDDEN**：禁止自行參照非轉換指引提供的外部檔案或資源
**FORBIDDEN**：禁止主動優化或簡化原始業務邏輯

### Technology Constraints
**核心框架**：Vue 3 (Composition API)
**語言**：JavaScript
**元件庫**：Quasar Framework
**狀態管理**：Pinia
**路由管理**：Vue Router
**表單驗證**：VeeValidate（Composition API）+ Yup
**HTTP 請求**：customAxios(`@/assets/plugins/customAxios.js`)
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

### R1：翻新項目
**REQUIRED**：JSP 翻新項目分為四類：
  - **等價技術棧**：新舊技術棧間存在直接對應關係，可直接翻新
  - **無等價技術棧**：因新舊技術棧間無直接對應關係，需依翻新指引文件處理
  - **舊有自訂依賴**：舊專案自訂的共用依賴，其內部邏輯為黑盒，因此需依翻新指引文件處理
  - **直接移除**：因架構轉變而不再適用的項目，需直接移除

---

### R2：等價技術棧
**REQUIRED**：新舊技術棧存在可直接對應關係的翻新項目，例如：
  - JSTL core -> Vue template
  - Prototype.js、JQuery DOM 操作 -> Vue 原生
  - JQuery AJAX、Prototype.js Ajax、XMLHttpRequest -> customAxios
  - inline Style、棄用 HTML 屬性 -> Vue template + `:style`
  - `<form action="...">`、`window.location.href` -> Vue Router
  - `${param.xxx}`、`request.getParameter('xxx')` -> `route.query.xxx`

---

### R3：無等價技術棧
**REQUIRED**：新專案無直接對應的技術棧，包含但不限於：

```md
| 舊技術棧 | 新技術棧 | 翻新指引文件索引 |
|---------|---------|-------------|
| Validation.js | VeeValidate（Composition API）+ Yup + Quasar Form | [表單驗證翻新指引](references/form-validation.md) |
| Server-side 資料注入 | onMounted() + customAxios | [Server-side 資料注入翻新指引](references/server-data-injection.md) |
```

**Server-side** 常見資料注入語法：
  - EL：`${data}`
  - `request.getAttribute('data')`
  - `session.getAttribute('data')`
  - `application.getAttribute('data')`
  - `<%=data%>`

**EXCEPTION**：**IF** `data` 來源為頁面內部宣告（`<c:set>`、`<c:forEach>` 迭代變數等）**THEN** 直接翻新（R2），不進入 Server-side 資料注入翻新指引流程

---

### R4. 舊有自訂依賴翻新指引
- **IF** skipCM=true **THEN** 跳過所有「舊有自訂依賴」的翻新指引文件
- **ELSE**：紀錄舊專案的自訂依賴來源的引用 pattern，以便對照同名的翻新指引文件：
  - custom taglibs：`<%@ taglib prefix="{prefix}">` -> `references/tag/{prefix}.md`
  - custom JavaScript：`<script src="{fileName}">` -> `references/js/{fileName}.js.md`
  - custom JSP：`<%@ include file="{fileName}" %>` -> `references/jsp/{fileName}.jsp.md`
  - custom CSS：`<link rel="stylesheet" ...>` -> 已於 main.js 中統一處理，頁面內不再額外引入
  - 靜態資源：`<img src="{filePath}">` -> 直接註解 TODO，後續人工處理; **EXCEPTION**：`calendar.gif` -> `<q-icon name="event">`

---

### R5：直接移除
**REQUIRED**：因 JSP MPA -> Vue SPA 的架構轉變，以下項目將直接移除：
  - HTML Root & Metadata，ex：`<html>`, `<head>`, `<body>`
  - 引用語法，ex：`<%@ page ... %>`, `<%@ taglib ... %>`, `<%@ include ... %>`

---

### R6：TODO 規則

**IF**：無等價技術棧（R3） **AND** 無對應翻新指引 **THEN** 註解 TODO 錨點以供後續人工處理

**IF**：`skipCM=true`：跳過所有「舊有自訂依賴」的翻新指引文件，直接建立 TODO 錨點以供後續人工處理
**ELSE**：依照 pattern 查找對應的翻新指引文件
  **IF**：有對應的翻新指引（R4） **THEN** 汰換舊有自訂依賴為翻新指引提供的對應轉換方案
**ELSE**：未被翻新指引覆蓋的項目 **THEN** 建立 TODO 錨點以供後續人工處理

**舊有自訂依賴**：指 JSP 專案提供的自訂依賴，包含但不限於
  - JSP include，ex：`<%@ include file="{fileName}" %>`
  - Custom Tag，ex：`<custom:tag ...>`
  - 外部方法，ex：`someFunction()`
  - 外部類別，ex：`new SomeClass()`、`SomeClass.someMethod()`、`SomeClass.someProperty`

**TODO Composable**：
**REQUIRED**：依照自訂依賴的類型，建立對應的 TODO 錨點：

```vue
/** JSP include：於原始位置註解 TODO */
<!-- TODO: `<%@ include file="{fileName}" %>` -->

/** Custom Tag：於原始位置註解 TODO */
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
**REQUIRED**：識別 JSP 無等價技術棧及其對應的翻新指引文件（R3）
**IF** skipCM=true **THEN** 跳過所有「舊有自訂依賴」的翻新指引文件
**ELSE**：識別 JSP 中的舊有自訂依賴來源的引用是否有對應的翻新指引文件（R4）

#### Step 2：建立決策紀錄
**REQUIRED**：根據掃描結果，建立決策紀錄，包含但不限於：
  - 表單驗證群組 + 驗證欄位 + 驗證規則
  - Server-side 資料與 API response 賦值
  - 自訂依賴的具體汰換方案

---

### Phase 2: 翻新實作
#### Step 1：註解 TODO 錨點
**REQUIRED**：檢查是否存在翻新指引未覆蓋的項目：
  - 無等價技術棧（R3）且無對應翻新指引文件
  - 舊有自訂依賴（R4）且未被翻新指引決策覆蓋（skipCM=true 直接建立 TODO）
**REQUIRED**：以對應的 TODO 錨點註解原始語法（R6）供後續人工處理

#### Step 2：直接翻新/移除
**REQUIRED**：直接移除不再適用的項目（R5）
**REQUIRED**：翻新等價技術棧（R2）

#### Step 3：依翻新指引實作決策
**REQUIRED**：基於分析階段的決策將舊技術棧、舊有自訂依賴汰換為翻新指引提供的對應轉換方案

---

### Phase 3: 驗證與結論紀錄
#### Step 1：檢驗翻新結果
**REQUIRED**：驗證翻新結果，確保 Evaluation Checklist 中的項目皆符合要求
**IF**：若有違規項目，根據違規類型回到對應的翻新規則（R1-R6）進行修正
**ELSE**：若無違規項目，則建立 Vue SFC 並加入路由管理

#### Step 2：輸出翻新結果
**REQUIRED**：以結構化的表格或清單形式輸出翻新結果於對話視窗，包含但不限於：
  - 表單驗證群組 + 驗證欄位 + 驗證規則
  - Server-side 資料與 API response 賦值
  - 自訂依賴的具體汰換方案
  - TODO 錨點列表與對應的待處理項目描述

**FORBIDDEN**：禁止生成分析報告或任何輔助文件，所有輸出應直接呈現在對話視窗中

---

## Evaluation Checklist
### 輸出完整性
  - [ ] 產出 Vue SFC
  - [ ] 更新路由管理
  - [ ] Vue SFC 無語法錯誤
  - [ ] 翻新結果以結構化的表格或清單形式呈現於對話視窗

### R2 等價技術棧
  - [ ] 所有等價技術棧項目皆已翻新
  - [ ] 翻新後的技術棧符合 Vue 3 SFC 的最佳實踐

### R3 無等價技術棧
  - [ ] 所有無等價技術棧項目皆已依翻新指引處理或註解 TODO 錨點
  - [ ] 表單驗證群組 + 驗證欄位 + 驗證規則皆已正確識別並翻新
  - [ ] Server-side 資料與 API response 賦值皆已正確識別並翻新

### R4 舊有自訂依賴翻新指引
  - [ ] **IF** skipCM=true **THEN** 所有「舊有自訂依賴」項目皆已註解 TODO 錨點
  - [ ] **ELSE** 所有「舊有自訂依賴」項目皆已依分析決策翻新或註解 TODO 錨點

### R5 直接移除項目
  - [ ] 所有 HTML Root & Metadata 已移除
  - [ ] 所有引用語法已移除

### R6 TODO 規則
  - [ ] 所有無等價技術棧且無對應翻新指引的項目皆已註解 TODO 錨點
  - [ ] 所有未被決策覆蓋的舊有自訂依賴項目皆已依規則註解 TODO 錨點
  - [ ] 所有 TODO 錨點皆保留原始語法作為追蹤依據
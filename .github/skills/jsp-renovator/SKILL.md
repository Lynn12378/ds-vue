---
name: jsp-renovator
description: 將單頁 Legacy JSP 翻新為 Vue 3 SFC
argument-hint: jsp=<JSP 檔案路徑>
disable-model-invocation: true
user-invocable: true
---

# JSP Renovator

## Goals

### Primary
基於技術翻新與 Server-side 注入資料來源補全，將單頁 Legacy JSP 翻新為符合專案前端規範的 Vue 3 SFC。

### Secondary
1. JSP 檔案內逐字可見的程式碼完整翻新至對應技術棧
2. 技術棧行為落差、無等價技術棧、自訂資源的項目依對應翻新指引轉換
3. Server-side 注入資料來源依翻新指引補全
4. 產出可運行的 Vue SFC 與路由更新

---

## Constraints

### Scope Boundaries

- **REQUIRED**
  - 翻新來源僅限 JSP 檔案內逐字可見的程式碼
  - 技術棧行為落差、無等價技術棧、自訂資源的項目須依對應翻新指引轉換
  - 無翻新指引的項目一律 Fallback，不得推論實作

- **FORBIDDEN**
  - 禁止推論、補充 JSP 檔案內未逐字可見的程式碼
  - 禁止在無對應翻新指引的情況下實作自訂資源或無等價技術棧項目的內部邏輯
  - 禁止參照其他頁面寫法新增不存在於當前 JSP 的規格
  - 禁止主動優化或簡化 JSP 檔案內逐字可見的業務邏輯

### Technology Constraints

- **核心框架**：Vue 3（Composition API，`<script setup>`）
- **UI 元件庫**：Quasar Framework
- **狀態管理**：Pinia
- **路由**：Vue Router
- **表單驗證**：VeeValidate（Composition API）+ Yup + Quasar form 元件
- **HTTP 請求**：customAxios（`@/assets/libs/axios/instance.js`）
- **日期處理**：Day.js
- **Script 語言**：JavaScript

### Output Constraints

- **分析報告**: `.github/ir/analysis/{FileName}-analysis.md`
- **Vue SFC**: `src/views/{Module}/{FileName}.vue`
- **路由更新**: `src/router/index.js`

---

## Context Variables

{FileName}   = JSP 檔名，systemCode(2) + moduleCode(2) + subCode(4)，例：DSA30900
{Bean_Name}  = JSP 對應 bean，systemCode(2) + moduleCode(2) + '_' + subCode(4)，例：DSA3_0900
{Module}     = JSP 對應模組，moduleCode(2)，例：A3
{dispatcher} = 後端 baseUrl，已於 customAxios 封裝，翻新時不需傳入
{resource-name} = 自訂資源翻新指引檔名，kebab-case，例：table-ui-js、calendar-js

---

## Rules

### R1：(A) 直接翻新

**REQUIRED**
- 有 1:1 等價技術棧的項目，依技術棧對照表直接翻新
- DOM 節點的 Class 必須完整保留

**FORBIDDEN**
- 禁止推論 JSP 檔案內未明確定義的業務邏輯
- 禁止重構原始 HTML 版面結構
- 禁止自行增加 JSP 未明確定義的功能
- 禁止自行添加樣式

#### 移除項目
| 原始項目 | 處理 |
|---|---|
| JSP 宣告、taglib 引用、JSP 註解 | 移除 |
| HTML 結構標籤（`<html>`, `<head>`, `<body>`） | 移除 |
| `<style>` 區塊、`<link>` CSS 引用 | 移除 |
| `<script src="...">` 外部 JS 引用標籤 | 移除 |
| 字體樣式 `@font-face` | 移除 |

#### 技術棧對照
| 原始技術棧 | 翻新目標 |
|---|---|
| JSTL core | Vue template 指令 |
| Prototype.js | Vue 原生 |
| jQuery | Vue 原生 |
| inline style / 廢棄 HTML 屬性 | `:style` binding |
| CSS `class` | 保留 |
| Ajax（Prototype.js / jQuery / 原生） | `customAxios` |
| `<form action="...">` / `window.location.href` | `router.push` |
| `${param.xxx}` | `route.query.xxx` |

---

### R2：(B) 規範輔助翻新

已知舊技術棧行為，但翻新後行為不確定或存在行為落差，需依照對應翻新指引定義翻新後行為。

#### R2-1：Quasar 元件替換

以下 JSP Pattern 需轉換為 Quasar 元件，參照 [Quasar 元件翻新指引](references/quasar-components.md)。

| JSP Pattern | 對應 Quasar 元件 |
|---|---|
| `<table>` | QMarkupTable |
| `<input type="text">` | QInput |
| `<textarea>` | QInput |
| `<select>` | QSelect |
| `<input type="checkbox">` | QCheckbox |
| `<input type="radio">` | QRadio |
| `<input type="button">` / `<button>` | QBtn |
| `<input type="file">` | QFile |
| `<input type="hidden">` | `ref` |
| `alert(...)` / `confirm(...)` | QDialog |

**EXCEPTION**：以下 Pattern 涉及自訂資源，需在 R2-1 一般對照之前優先識別，並移交 R3 處理：

**IF** 分頁表格：`<table id=$id>` + `TableUI($id,...)` **THEN** 移交 R3，參照 [TableUI.js 翻新指引](references/jsp/tableUI-js.md)

**IF** 日期選擇器：`<input>` + `<img calendar.gif getCalendar()>` **THEN** 移交 R3，參照 [calendar.js 翻新指引](references/jsp/calendar-js.md)

#### R2-2：表單驗證翻新

**IF** 使用 `new Validation(...)` 實例化
**THEN** 參照 [表單驗證翻新指引](references/jsp/validation.md)

#### R2-3：Server-side 資料補全

以下語法識別為 Server-side 注入，需依照翻新指引補全資料來源，
參照 [Server-side 資料補全指引](references/server-side.md)。

| 識別語法 |
|---|
| `${xxx}` |
| `<%=request.getParameter("xxx")%>` |
| `<%=request.getAttribute("xxx")%>` |
| `<%=session.getAttribute("xxx")%>` |
| `<%=application.getAttribute("xxx")%>` |
| `<%=xxx%>` |

**EXCEPTION**
- **IF** `${param.xxx}` **THEN** 直接翻新為 `route.query.xxx`
- **IF** `${xxx}` 來源為頁面內部宣告（`<c:set>`、`<c:forEach>` 迭代變數等）**THEN** 直接翻新（R1）

---

### R3：(C) 自訂資源翻新

**REQUIRED**：舊技術棧自訂資源，因外部資源實作不可見，需依照對應翻新指引轉換。

**REQUIRED**：以下類型識別為自訂資源：

- **外部函式呼叫**：ex：`CSRUtil.*`、`PageUI.*`、`popupWin.*`、`TableUI.*`
- **Custom Tag**：ex：`<cathay:*>`、`<dz:*>`、`<CXL:*>`、`<fmt:*>`
- **JSP include**：ex：`<%@ include file="..."%>`
- **Java 類別呼叫**：ex：`DateUtil.*`、`StringUtils.*`

**IF** 有對應翻新指引 **THEN** 參照 [翻新指引](references/jsp/{resource-name}.md) 轉換
**IF** 無對應翻新指引 **THEN** Fallback（參照 R4）

---

### R4：Fallback

**REQUIRED**：以下情境一律建立 Fallback composable 作為佔位，提供人工接手的錨點：
- R2 識別到無等價技術棧且無對應翻新指引的項目
- R3 無對應翻新指引的自訂資源

**REQUIRED**：Fallback 必須對應原始呼叫的傳入與傳出結構，確保程式可運行且不報錯：
- **有傳入值**：一律使用 `(...args) => args[0] ?? null`，不推論參數型別與回傳值
- **無傳入值**：回傳 `() => {}`
- **有包裹子元素**：使用 `useSlots().default?.()` 透傳 slot

**REQUIRED**：Fallback 需集中於 `<script setup>` 最底部，並以 `// region Fallback` / `// endregion Fallback` 包裹。

**FORBIDDEN**
- 禁止實作 Fallback 內部邏輯
- 禁止於 Fallback region 以外定義 Fallback composable

#### 命名規則

| 情境 | 命名規則 | 範例 |
|---|---|---|
| 來源明確的外部函式 | `use{ResourceName}` | `useCSRUtil`、`usePageUI` |
| 來源不明的外部函式 | `use{MethodName}` | `useGetCalendar` |
| Custom Tag | `use{Prefix}`，方法集中 | `useCathay`、`useDz` |
| JSP include | `use{FileName}` | `useHeader` |
| Java 類別 | `use{ClassName}` | `useDateUtil` |

#### Fallback 結構

```js
// region Fallback

// TODO: 原始語法
const use{ResourceName} = () => {

  /** ✅ 有包裹子元素：slot 透傳 */
  const {methodName1} = () => useSlots().default?.()

  /** ✅ 無傳入值的函式 */
  const {methodName2} = () => {}

  /** ✅ 有傳入值的函式 */
  const {methodName3} = (...args) => args[0] ?? null

  /** ❌ 禁止實作內部邏輯 */
  const {methodName} = (...args) => {
    return args[0].length > 0 // 禁止：自行推論實作
  }

  return { {methodName1}, {methodName2}, {methodName3} }
}

// endregion Fallback
```

---

### R5：註解規範

| 註解 | 語義 | 使用時機 |
|---|---|---|
| `// FIXME: 原始語法 → 翻新後語法 － 需確認行為等價` | 翻新後行為可能與原始不一致，需人工確認 | agent 判斷翻新結果有行為落差風險時 |
| `// TODO: 原始語法` | 此處無法翻新，需人工接手 | R3 無對應翻新指引，或 R2 識別到無等價技術棧且無對應翻新指引的項目（Fallback） |

---

## Workflow

### Step 1：分析
掃描 JSP 識別所有 R2、R3、Fallback 項目，產出分析報告：
- 產出路徑：`.github/ir/analysis/{FileName}-analysis.md`

### Step 2：建立 Fallback
依分析報告，建立所有 Fallback composable，固定於 `<script setup>` 最底部。

### Step 3：R1 直接翻新
依技術棧對照表逐行翻新所有 R1 項目。

### Step 4：R2 規範輔助翻新
依分析報告逐項翻新，順序如下：
1. Quasar 元件替換（R2-1）
2. 表單驗證翻新（R2-2）
3. Server-side 資料補全（R2-3）

### Step 5：R3 自訂資源翻新
依分析報告，依對應翻新指引轉換所有自訂資源。

### Step 6：驗證
對照 Evaluation Checklist 逐項確認，發現問題依對應翻新指引修正，不得自行推斷。

---

## Evaluation Checklist

### 產出完整性
- [ ] 分析報告已產出至 `.github/ir/analysis/{FileName}-analysis.md`
- [ ] Vue SFC 已產出至 `src/views/{Module}/{FileName}.vue`
- [ ] 路由已更新至 `src/router/index.js`
- [ ] Vue SFC 語法結構正確，無語法錯誤

### 直接翻新（R1）
- [ ] 所有移除項目已直接移除，無殘留
- [ ] 所有技術棧對照表項目已翻新，無遺漏
- [ ] 所有 Class 完整保留，無新增或移除
- [ ] 原始 HTML 版面結構未重構，層級與順序與原始一致
- [ ] 無自行新增樣式
- [ ] 無自行增加 JSP 未明確定義的功能

### Quasar 元件替換（R2-1）
- [ ] 所有 JSP Pattern 已對應至正確 Quasar 元件
- [ ] R2-1 EXCEPTION Pattern 已優先識別並移交 R3 處理
- [ ] 所有 Quasar 元件符合翻新指引規範

### 表單驗證（R2-2）
- [ ] 所有 `new Validation(...)` 實例化已識別
- [ ] 所有內建驗證規則皆找到對應 Yup method 或 TODO 佔位
- [ ] 表單驗證翻新符合翻新指引規範

### Server-side 資料補全（R2-3）
- [ ] 所有 Server-side 注入語法已識別，無遺漏
- [ ] 所有 Server-side 注入資料來源已依翻新指引補全或 TODO 佔位
- [ ] `${param.xxx}` 已直接翻新為 `route.query.xxx`
- [ ] 頁面內部宣告的 `${xxx}` 已直接翻新（R1），未誤判為 Server-side 注入

### 自訂資源（R3）
- [ ] 所有自訂資源已識別，無遺漏
- [ ] 有翻新指引的自訂資源已依指引轉換
- [ ] 無翻新指引的自訂資源已建立 Fallback

### Fallback（R4）
- [ ] 所有 Fallback composable 集中於 `// region Fallback` / `// endregion Fallback`
- [ ] Fallback region 位於 `<script setup>` 最底部
- [ ] 所有 Fallback composable 命名符合命名規則
- [ ] 所有 Fallback composable 無內部邏輯實作
- [ ] 有包裹子元素的 Fallback 使用 `useSlots().default?.()` 透傳 slot
- [ ] 有傳入值的 Fallback 使用 `(...args) => args[0] ?? null`
- [ ] 無傳入值的 Fallback 使用 `() => {}`

### 註解（R5）
- [ ] 所有有行為落差風險的翻新點已標記 `// FIXME:`
- [ ] 所有 Fallback 已標記 `// TODO: 原始語法`
- [ ] FIXME 格式符合：`原始語法 → 翻新後語法 － 需確認行為等價`
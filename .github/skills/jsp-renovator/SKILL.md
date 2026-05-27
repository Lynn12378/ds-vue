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
基於技術翻新與 Server-side 注入資料來源補全，將單頁 Legacy JSP 翻新為符合翻新指引的 Vue 3 SFC。

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
  - 翻新指引一律來源於與 SKILL 同層的 `references/` 目錄，不得自行推論或補充
  - 技術棧行為落差、無等價技術棧、自訂資源的項目須依對應翻新指引轉換
  - 無翻新指引的項目一律 Fallback，不得推論實作

- **FORBIDDEN**
  - 禁止推論、補充 JSP 檔案內未逐字可見的程式碼
  - 禁止主動優化或簡化 JSP 檔案內逐字可見的業務邏輯
  - 禁止在無對應翻新指引的情況下實作自訂資源或無等價技術棧項目的內部邏輯

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

- **分析報告**: `.github/ir/{FileName}-analysis.md`
- **Vue SFC**: `src/views/{Module}/{FileName}.vue`
- **路由更新**: `src/router/index.js`

---

## Context Variables

{FileName}      = JSP 檔名，systemCode(2) + moduleCode(2) + subCode(4)，例：DSA30900
{Bean_Name}     = JSP 對應 bean，systemCode(2) + moduleCode(2) + '_' + subCode(4)，例：DSA3_0900
{Module}        = JSP 對應模組，moduleCode(2)，例：A3
{dispatcher}    = 後端 baseUrl，已於 customAxios 封裝，翻新時不需傳入
{resource-name} = 自訂資源翻新指引檔名（含副檔名），例：calendar.js.md

---

## Rules

### R1：(A) 直接翻新

**REQUIRED**：
- 有 1:1 等價技術棧的項目，依技術棧對照表直接翻新
- DOM 節點的 Class 必須完整保留

**FORBIDDEN**：
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

**REQUIRED**：已知舊技術棧行為，但翻新後行為不確定或存在行為落差，需依照對應翻新指引定義翻新後行為。

#### R2-1：Quasar 元件替換

以下 JSP Pattern 需轉換為 Quasar 元件，參照 [Quasar 元件翻新指引](references/quasar-components.md)。

| JSP Pattern | 對應 Quasar 元件 |
|---|---|
| `<table>` | q-markup-table |
| `<input type="text">`、`<textarea>` | q-input |
| `<select>` | q-select |
| `<input type="checkbox">` | q-checkbox |
| `<input type="radio">` | q-radio |
| `<input type="button">` / `<button>` | q-btn |
| `<input type="file">` | q-file |
| `<input type="hidden">` | `ref` |
| `alert(...)` / `confirm(...)` | q-dialog |

**EXCEPTION**：以下 Pattern 涉及自訂資源，Step 1 分析時需識別並記錄於對話視窗，並於 Step 5 移交 R3 處理：

| Pattern | 對應翻新指引 |
|---|---|
| 分頁表格：`<table id=$id>` + `TableUI($id,...)` | [TableUI.js 翻新指引](references/js/TableUI.js.md) |
| 日期選擇器：`<input>` + `<img calendar.gif>` | [calendar.js 翻新指引](references/js/calendar.js.md) |

#### R2-2：表單驗證翻新

**IF** 頁面 JS 內使用 `new Validation(...)` 實例化
**THEN** 參照 [表單驗證翻新指引](references/validation.md)

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

**EXCEPTION**：
- **IF** `${param.xxx}` **THEN** 直接翻新為 `route.query.xxx`
- **IF** `${xxx}` 來源為頁面內部宣告（`<c:set>`、`<c:forEach>` 迭代變數等）**THEN** 直接翻新（R1）

---

### R3：(C) 自訂資源翻新

**REQUIRED**：舊技術棧自訂資源，因外部資源實作不可見，需依照對應翻新指引轉換。

**REQUIRED**：識別頁面引用的所有外部資源，依以下規則查找對應翻新指引：

| 引用語法 | 翻新指引查找路徑 |
|---|---|
| `<script src=".../xxx.js">` | `references/js/xxx.js.md` |
| `<%@ taglib prefix="xxx" %>` | `references/tag/xxx.md` |
| `<%@ include file=".../xxx.jsp" %>` | `references/jsp/xxx.jsp.md` |
| `<%@ page import="...XxxClass" %>` | `references/java/XxxClass.md` |

**REQUIRED**：識別外部資源提供的功能，以下為需翻新的功能類型：

| 功能類型 | 範例 |
|---|---|
| 外部方法呼叫 | `CSRUtil.isSuccess(resp)`、`Date.toROC(d)`、`getCalendar()` |
| 外部實例化 | `new Validation('form1', ...)`、`new TableUI(...)` |
| JSP include | `<%@ include file="/html/CM/header.jsp"%>` |
| Custom Tag | `<cathay:formatNumber value="${xxx}"/>` |
| Java 類別呼叫 | `DateUtil.format(date)` |

**IF** 來源資源對應翻新指引存在 **THEN** 該來源資源內所有功能依翻新指引轉換
**IF** 來源資源對應翻新指引不存在 **OR** 來源不明的功能 **THEN** 該來源資源內所有功能一律 Fallback（參照 R4）

---

### R4：Fallback

**REQUIRED**：以下情境一律建立 Fallback composable 作為佔位，提供人工接手的錨點：
- R2 識別到無等價技術棧且無對應翻新指引的項目
- R3 無對應翻新指引的自訂資源
- R3 來源不明的功能

**REQUIRED**：Fallback 必須對應原始呼叫的傳入與傳出結構，確保程式可運行且不報錯：
- **有傳入值**：一律使用 `(...args) => args[0] ?? null`，不推論參數型別與回傳值
- **無傳入值**：回傳 `() => {}`
- **有包裹子元素**：使用 `useSlots().default?.()` 透傳 slot

**REQUIRED**：Fallback 需集中於 `<script setup>` 最底部，並以 `// region Fallback` / `// endregion Fallback` 包裹。

**FORBIDDEN**：
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

  return { {methodName1}, {methodName2}, {methodName3} }
}

// endregion Fallback
```

#### ❌ 錯誤示範：禁止實作內部邏輯

```js
const use{ResourceName} = () => {
  const {methodName} = (...args) => {
    return args[0].length > 0 // ❌ 禁止：自行推論實作
  }
  return { {methodName} }
}
```

---

### R5：註解規範

`// FIXME: 缺口描述` — 翻新後行為可能與原始不一致，需人工確認；缺口描述為翻新後與原始行為的落差說明。
`// TODO: 原始語法` — 此處無法翻新，需人工接手；原始語法為 JSP 中逐字可見的原始呼叫語法。

| 註解 | 使用時機 |
|---|---|
| `// FIXME: 缺口描述` | agent 判斷翻新結果有行為落差風險時 |
| `// TODO: 原始語法` | R3 無對應翻新指引，或 R2 識別到無等價技術棧且無對應翻新指引的項目（Fallback） |

---

## Workflow

### Step 1：分析

掃描 JSP 識別所有 R2、R3、Fallback 項目：

**對話視窗**：以結構化表格分別列出所有 R2/R3 識別項目與對應翻新指引決策：
- Server-side 資料
- 表單驗證
- Quasar 元件替換（含 EXCEPTION 項目）
- 自訂資源：
  - 識別頁面所有外部資源引用（`<script src>`、`<%@ taglib>`、`<%@ include>`、`<%@ page import>`）
  - 查找各外部資源對應翻新指引
  - 識別各外部資源提供的功能（外部方法呼叫、外部實例化、JSP include、Custom Tag、Java 類別呼叫）
  - 來源不明的功能一律列為 Fallback

**分析報告**：僅記錄 Fallback 項目，產出至 `.github/ir/{FileName}-analysis.md`，依以下模板產出：

```markdown
# {FileName} Fallback 分析報告

## Fallback 清單

### use{ResourceName}
- **原始語法**：`原始呼叫語法`
- **觸發規則**：R3 無對應翻新指引 / R2 無等價技術棧且無翻新指引 / R2-1 EXCEPTION / 來源不明
- **方法清單**：
  | 方法名稱 | 傳入值 | 包裹子元素 |
  |---|---|---|
  | `methodName` | 有/無 | 有/無 |
```

### Step 2：建立 Fallback

依分析報告，建立所有 Fallback composable，並固定於 `<script setup>` 最底部。

### Step 3：R1 直接翻新

依技術棧對照表逐行翻新所有 R1 項目。

### Step 4：R2 規範輔助翻新

依 Step 1 對話視窗決策逐項翻新，順序如下：
1. Quasar 元件替換（R2-1）；**EXCEPTION 項目必須改由 Step 5 統一處理**
2. 表單驗證翻新（R2-2）
3. Server-side 資料補全（R2-3）

### Step 5：R3 自訂資源翻新

依 Step 1 對話視窗決策逐項處理：
1. 有翻新指引的外部資源 → 依翻新指引轉換該資源內所有功能
2. 無翻新指引的外部資源 → 該資源內所有功能一律 Fallback
3. 來源不明的功能 → 一律 Fallback
4. R2-1 EXCEPTION 項目 → 依對應翻新指引轉換

### Step 6：驗證

對照 Evaluation Checklist 逐項確認，發現問題必須依對應翻新指引修正。

**FORBIDDEN**：禁止自行推斷或實作未符合翻新指引的行為

---

## Evaluation Checklist

### 產出完整性
- [ ] 分析報告已產出至 `.github/ir/{FileName}-analysis.md`
- [ ] Vue SFC 已產出至 `src/views/{Module}/{FileName}.vue`
- [ ] 路由已更新至 `src/router/index.js`
- [ ] Vue SFC 語法結構正確，無語法錯誤

### R1 直接翻新
- [ ] 所有移除項目已移除，無殘留
- [ ] 所有 Class 完整保留於對應 DOM 節點
- [ ] 原始 HTML 版面結構無重構

### R2 規範輔助翻新
- [ ] R2-1 EXCEPTION Pattern 已移交 R3 處理
- [ ] 所有 `new Validation(...)` 實例化已識別並翻新
- [ ] 所有 Server-side 注入語法已識別，無遺漏
- [ ] 所有補全資料已標注 `// FIXME: Server-side 資料來源待確認`

### R3 自訂資源
- [ ] 所有外部資源引用已識別，並查找對應翻新指引
- [ ] 無翻新指引的外部資源及來源不明的功能已建立 Fallback

### R4 Fallback
- [ ] 所有 Fallback composable 集中於 `// region Fallback` / `// endregion Fallback`
- [ ] Fallback region 位於 `<script setup>` 最底部
- [ ] 所有 Fallback composable 無內部邏輯實作

### R5 註解
- [ ] 所有行為落差風險的翻新點已標記 `// FIXME: 缺口描述`
- [ ] 所有 Fallback 已標記 `// TODO: 原始語法`
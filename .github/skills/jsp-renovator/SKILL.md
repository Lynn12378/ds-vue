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
2. 技術棧行為落差、行為不確定、自訂資源的項目依 `references/` 目錄內翻新指引轉換
3. Server-side 注入資料來源依翻新指引補全
4. 產出可運行的 Vue SFC 與路由更新

---

## Constraints

### Scope Boundaries

- **REQUIRED**
  - 翻新來源僅限 JSP 檔案內逐字可見的程式碼
  - 所有翻新指引來源僅限與 SKILL 同層的 `references/` 目錄
  - 無對應翻新指引的項目一律執行 R4 Fallback

- **FORBIDDEN**
  - 禁止推論或補充 JSP 檔案內未逐字可見的程式碼
  - 禁止主動優化或簡化原始業務邏輯
  - 禁止在無翻新指引的情況下實作任何自訂資源或無等價技術棧項目的內部邏輯

### Technology Constraints

| 分類 | 技術 |
|---|---|
| 核心框架 | Vue 3（Composition API，`<script setup>`） |
| UI 元件庫 | Quasar Framework |
| 狀態管理 | Pinia |
| 路由 | Vue Router |
| 表單驗證 | VeeValidate（Composition API）+ Yup + Quasar form 元件 |
| HTTP 請求 | customAxios（`@/assets/libs/customAxios/index.js`） |
| 日期處理 | Day.js |
| Script 語言 | JavaScript |

### Output Constraints

| 產出物 | 路徑 |
|---|---|
| Vue SFC | `src/views/{Module}/{FileName}.vue` |
| 路由更新 | `src/router/index.js` |
| 待處理清單 | `.github/ir/{FileName}-todo-list.md` |

---

## Context Variables

| 變數 | 說明 |
|---|---|
| `{FileName}` | JSP 檔名，格式：systemCode(2) + moduleCode(2) + subCode(4) |
| `{Bean_Name}` | 對應後端 bean，格式：systemCode(2) + moduleCode(2) + `_` + subCode(4) |
| `{Module}` | 對應模組，格式：moduleCode(2) |

---

## Rules

### R1：直接翻新

適用範圍：JSP 技術棧與 Vue 3 技術棧存在明確 1:1 對應的項目。

**REQUIRED**：
- 依技術棧對照表直接翻新
- 原始 DOM 節點的所有 CSS class 完整保留

**FORBIDDEN**：
- 禁止重構原始 HTML 版面結構
- 禁止新增 JSP 未定義的功能
- 禁止新增任何樣式

#### 移除項目

| 原始項目 | 處理 |
|---|---|
| JSP 頁面宣告（`<%@ page %>`）、taglib 引用、JSP 註解 | 移除 |
| HTML 結構標籤（`<html>`、`<head>`、`<body>`） | 移除 |
| `<style>` 區塊、`<link>` CSS 引用 | 移除 |
| `<script src="...">` 外部 JS 引用標籤 | 移除 |
| `@font-face` 字體宣告 | 移除 |

#### 技術棧對照表

| 原始技術棧 | 翻新目標 |
|---|---|
| JSTL `<c:if>`、`<c:forEach>` 等 | Vue template 對應指令（`v-if`、`v-for` 等） |
| Prototype.js / jQuery DOM 操作 | Vue 原生（`ref`、`reactive`、`computed` 等） |
| `inline style` / 廢棄 HTML 屬性（`align`、`bgcolor` 等） | `:style` binding |
| CSS `class` 屬性 | 原樣保留 |
| Ajax 請求（Prototype.js / jQuery / 原生 XMLHttpRequest） | `customAxios` |
| `<form action="...">` 表單提交 / `window.location.href` 頁面跳轉 | `router.push` |
| `${param.xxx}` | `route.query.xxx` |

---

### R2：規範輔助翻新

適用範圍：原始技術棧有對應 Quasar 元件或 `references/` 內有對應翻新指引，但翻新後行為與原始存在落差或不確定性，需依指引定義翻新行為的項目。

#### R2-1：Quasar 元件替換

依 [Quasar 元件翻新指引](references/quasar-components.md) 轉換。

| 原始 JSP Pattern | 翻新目標 |
|---|---|
| `<table>`（非自訂資源） | `q-markup-table` |
| `<input type="text">`、`<textarea>` | `q-input` |
| `<select>` | `q-select` |
| `<input type="checkbox">` | `q-checkbox` |
| `<input type="radio">` | `q-radio` |
| `<input type="button">`、`<button>` | `q-btn` |
| `<input type="file">` | `q-file` |
| `<input type="hidden">` | `ref` |
| `alert(...)`、`confirm(...)` | `q-dialog` |

**EXCEPTION**：下列 Pattern 涉及自訂資源，不在 R2-1 處理，須於 Step 1 決策表標記為 R3，並於 Step 5 依 R3 處理：

| Pattern | 對應翻新指引 |
|---|---|
| `<table id="{id}">` 搭配 `new TableUI("{id}", ...)` | `references/js/TableUI.js.md` |
| `<input>` 搭配 `<img src="...calendar.gif">` | `references/js/calendar.js.md` |

#### R2-2：表單驗證翻新

識別條件：頁面 JS 內出現 `new Validation(...)` 實例化。

翻新指引：[表單驗證翻新指引](references/validation.md)

#### R2-3：Server-side 資料補全

識別條件：以下語法為 Server-side 注入，需依 [Server-side 資料補全指引](references/server-side.md) 補全資料來源。

| 識別語法 |
|---|
| `${xxx}` |
| `<%=request.getParameter("xxx")%>` |
| `<%=request.getAttribute("xxx")%>` |
| `<%=session.getAttribute("xxx")%>` |
| `<%=application.getAttribute("xxx")%>` |
| `<%=xxx%>` |

**EXCEPTION**（直接翻新，不走 R2-3）：
- `${param.xxx}` → `route.query.xxx`（R1）
- `${xxx}` 來源為頁面內部宣告（`<c:set>`、`<c:forEach>` 迭代變數等）→ 直接翻新（R1）

---

### R3：自訂資源翻新

適用範圍：JSP 引用的外部資源（JS、JSP include、taglib、Java 類別），其實作對 agent 不可見，需依 `references/` 目錄內對應翻新指引轉換。

#### 翻新指引查找規則

| 引用語法 | 翻新指引查找路徑 |
|---|---|
| `<script src=".../xxx.js">` | `references/js/xxx.js.md` |
| `<%@ taglib prefix="xxx" %>` | `references/tag/xxx.md` |
| `<%@ include file=".../xxx.jsp" %>` | `references/jsp/xxx.jsp.md` |
| `<%@ page import="...XxxClass" %>` | `references/java/XxxClass.md` |

#### 需識別的功能類型

| 功能類型 |
|---|
| 外部方法呼叫 |
| 外部實例化 |
| JSP include |
| Custom Tag |
| Java 類別呼叫 |

#### 翻新判斷

- **翻新指引存在**：該資源內所有功能依翻新指引轉換
- **翻新指引不存在** 或 **來源不明**：該資源內所有功能一律執行 R4 Fallback

**REQUIRED**：翻新指引內若以「見子文件」形式索引子文件，執行該翻新項目前必須先查閱對應子文件，不得略過。

---

### R4：Fallback

適用範圍：R2 無對應翻新指引的項目、R3 翻新指引不存在的自訂資源、R3 來源不明的功能。

#### Fallback Composable 規格

**REQUIRED**：
- 每個 Fallback 對應一個外部資源（或來源不明的功能群），以 composable 函式封裝
- Fallback 必須對應原始呼叫的傳入與回傳結構，確保程式可運行且不報錯
- 所有 Fallback composable 集中於 `<script setup>` 最底部，以 `// region Fallback` / `// endregion Fallback` 包裹

**FORBIDDEN**：
- 禁止實作 Fallback 內部邏輯
- 禁止在 `// region Fallback` / `// endregion Fallback` 以外定義 Fallback composable

#### 方法回傳值規則

| 方法特性 | 回傳值 |
|---|---|
| 有傳入值 | `(...args) => args[0] ?? null` |
| 無傳入值 | `() => {}` |
| 有包裹子元素 | `() => useSlots().default?.()` |

#### 命名規則

| 來源情境 | 命名規則 |
|---|---|
| 來源明確的外部 JS 資源 | `use{ResourceName}` |
| 來源不明的外部函式 | `use{MethodName}` |
| Custom Tag（依 prefix） | `use{Prefix}` |
| JSP include（依檔名） | `use{FileName}` |
| Java 類別（依類別名） | `use{ClassName}` |

#### Fallback 結構

```js
// region Fallback

// TODO: {原始呼叫語法}
const use{ResourceName} = () => {
  const {methodName1} = () => useSlots().default?.()  // 有包裹子元素
  const {methodName2} = () => {}                       // 無傳入值
  const {methodName3} = (...args) => args[0] ?? null  // 有傳入值
  return { {methodName1}, {methodName2}, {methodName3} }
}

// endregion Fallback
```

---

### R5：註解規範

| 註解 | 格式 | 標記時機 |
|---|---|---|
| `// TODO` | `// TODO: {原始呼叫語法}` | 每個 Fallback composable 定義前；原始呼叫語法為 JSP 中逐字可見的語法 |
| `// FIXME` | `// FIXME: {落差說明}` | 翻新結果與原始行為存在落差或不確定性時；落差說明描述具體行為差異 |

---

## Workflow

### Step 1：決策分析

掃描 JSP 全文，逐條識別所有需要 R2 / R3 處理的項目，建立內部決策表。決策表不輸出至對話視窗。

**REQUIRED**：每個識別項目必須完成下列三個欄位，全部完成後才可進入 Step 2：

- **原始語法**：JSP 內逐字可見的呼叫語法
- **適用規則**：R2-1 / R2-1(EXCEPTION→R3) / R2-2 / R2-3 / R3 / R4(Fallback)
- **翻新目標**：對應翻新指引條目或 Fallback 理由；R3 項目須先查找翻新指引後才可填寫

**R2-1 EXCEPTION 項目**：識別規則填 `R2-1(EXCEPTION→R3)`，翻新目標依對應翻新指引填寫，並於 Step 5 與其他 R3 項目統一處理。

### Step 2：建立 Fallback

依 Step 1 決策表中適用規則為 R4(Fallback) 的項目，於 `<script setup>` 最底部建立對應 Fallback composable。

### Step 3：R1 直接翻新

依 R1 技術棧對照表與移除項目規則，逐行翻新 JSP。

### Step 4：R2 規範輔助翻新

依 Step 1 決策表，按下列順序翻新所有 R2 項目：

1. R2-1：Quasar 元件替換（R2-1 EXCEPTION 項目不在此處理，留至 Step 5）
2. R2-2：表單驗證翻新
3. R2-3：Server-side 資料補全；每個補全項目標記 `// FIXME: Server-side 資料來源待確認`

### Step 5：R3 自訂資源翻新

依 Step 1 決策表，處理所有 R3 項目（含 R2-1 EXCEPTION 項目）：

- 翻新指引存在 → 依指引轉換該資源所有功能；翻新指引內有「見子文件」索引時，執行前先查閱對應子文件
- 翻新指引不存在 → 該資源所有功能執行 R4 Fallback

### Step 6：產出待處理清單

掃描已產出的 Vue SFC，收集所有 `// TODO` 與 `// FIXME` 註解，產出至 `.github/ir/{FileName}-todo-list.md`。

待處理清單格式：

```markdown
# {FileName} 待處理清單

## TODO — 需人工接手實作

| 位置 | 原始語法 |
|---|---|
| `{FileName}.vue:{行號}` | `{原始呼叫語法}` |

## FIXME — 翻新行為落差待確認

| 位置 | 落差說明 |
|---|---|
| `{FileName}.vue:{行號}` | `{落差說明}` |
```

### Step 7：驗證

對照 Evaluation Checklist 逐項確認，不符合項目必須依對應翻新指引修正後重新驗證。

**FORBIDDEN**：禁止在驗證階段自行推斷或實作未符合翻新指引的行為。

---

## Evaluation Checklist

### 產出完整性
- [ ] Vue SFC 已產出至 `src/views/{Module}/{FileName}.vue`
- [ ] 路由已更新至 `src/router/index.js`
- [ ] 待處理清單已產出至 `.github/ir/{FileName}-todo-list.md`
- [ ] Vue SFC 無語法錯誤

### R1 直接翻新
- [ ] 所有移除項目已移除，無殘留
- [ ] 所有原始 CSS class 完整保留於對應節點

### R2 規範輔助翻新
- [ ] 所有 Server-side 注入語法已識別且無遺漏
- [ ] 所有 R2-3 補全項目已標記 `// FIXME: Server-side 資料來源待確認`

### R3 自訂資源
- [ ] 所有外部資源引用已識別並查找對應翻新指引
- [ ] 翻新指引不存在的外部資源及來源不明的功能已執行 R4 Fallback

### R4 Fallback
- [ ] 所有 Fallback composable 集中於 `// region Fallback` / `// endregion Fallback`，且該區塊為 `<script setup>` 最底部
- [ ] 所有 Fallback composable 無內部邏輯實作

### R5 註解
- [ ] 每個 Fallback composable 定義前已標記對應 `// TODO: {原始呼叫語法}`
- [ ] 所有行為落差翻新點已標記 `// FIXME: {落差說明}`

### 待處理清單
- [ ] 待處理清單 TODO 筆數 = SFC 內 `// TODO` 總數
- [ ] 待處理清單 FIXME 筆數 = SFC 內 `// FIXME` 總數
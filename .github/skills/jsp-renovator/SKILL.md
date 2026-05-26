---
name: jsp-renovator
description: 將單頁 Legacy JSP 翻新為 Vue 3 SFC，業務行為等價還原，無法翻新項目以 TODO 標記。
argument-hint: jsp=<JSP 檔案路徑>
disable-model-invocation: true
user-invocable: true
---

# JSP Renovator

## Goals

### Primary
將單頁 Legacy JSP 翻新為等價的 Vue 3 SFC。

### Secondary
1. 完整保留 JSP 內部可見的業務邏輯與版面結構
2. 依專案規範執行技術棧替換
3. 依明確規則補償 Server-side 注入資料
4. 自訂資源依對應文件翻新，無文件一律 Fallback composable
5. 產出可運行的 Vue SFC 與路由更新

---

## Constraints

### Scope Boundaries

- **REQUIRED**
  - JSP 內部可見的業務規格必須完整還原
  - 技術棧翻新依 `.github/instructions/**` 規範執行
  - 不確定的翻新必須標記 FIXME/TODO，不得跳過

- **FORBIDDEN**
  - 禁止規範文件以外的行為改變
  - 禁止參照其他頁面寫法調整或新增不存在的頁面規格
  - 禁止主動優化或簡化原始業務邏輯
  - 禁止在分析報告（Step 1 產出）之外自行新增翻新決策
  - 禁止 Step 2～4 執行時重新解讀 JSP 或推測未記錄的決策

### Technology Constraints

| 技術 | 說明 |
|---|---|
| Vue 3（Composition API，`<script setup>`） | 核心框架 |
| Quasar Framework | UI 元件庫 |
| Pinia | 狀態管理 |
| Vue Router | 路由 |
| VeeValidate（Composition API）+ Yup | 表單驗證 |
| customAxios（`@/assets/libs/axios/instance.js`） | HTTP 請求 |
| Day.js | 日期處理 |
| JavaScript | Script 語言 |

### Output Constraints

- **分析報告**: `.github/ir/analysis/{FileName}-analysis.md`（Step 1 產出，後續步驟唯一執行依據）
- **Vue SFC**: `src/views/{Module}/{FileName}.vue`
- **路由更新**: `src/router/index.js`

---

## Context Variables

```
{FileName}   = JSP 檔名，systemCode(2) + moduleCode(2) + subCode(4)，例：DSA30900
{Bean_Name}  = JSP 對應 bean，systemCode(2) + moduleCode(2) + '_' + subCode(4)，例：DSA3_0900
{Module}     = JSP 對應模組，moduleCode(2)，例：A3
{dispatcher} = 後端 baseUrl，已於 customAxios 封裝，翻新時不需傳入
```

---

## Rules

### R1: 技術棧翻新規範

語義已知且有對應 1:1 技術棧的項目，依 agent 內建知識直接逐行翻新，以下為常見範例（非完整清單）：

| 原始技術棧 | 翻新目標 |
|---|---|
| Prototype.js（`$()`, `$$()`, `$F()`, `Event.observe()`...） | Vue 原生／Quasar |
| jQuery（`$()`...） | Vue 原生 |
| JSTL core（`<c:forEach>`, `<c:if>`, `<c:choose>`, `<c:set>`, `<c:out>`...） | Vue template 指令 |
| inline `style="..."` | `:style="{ }"` |
| HTML 廢棄屬性（`bgcolor`, `align`, `width`, `border`...） | `:style` binding |
| 原生 AJAX（`$.ajax`, `Ajax.Request`...） | `customAxios` |
| JSP 宣告（`<%@ page %>`, `<%@ taglib %>`） | 移除 |
| JSP 註解（`<%-- --%>`） | 移除 |
| HTML 結構標籤（`<html>`, `<head>`, `<body>`） | 移除 |
| `<style>` 區塊、`<link>` CSS 引用 | 移除（已遷移至全局樣式） |
| `<script>` 區塊 | 翻新至 `<script setup>` |
| CSS `class` | 保留 |
| `${param.xxx}` | `route.query.xxx` |

---

### R2: 規範文件索引

需依規範文件分析決策才能翻新的項目。

**參照文件：**
- [Quasar 元件轉換規範](../../instructions/quasar-components.instructions.md)
- [表單驗證翻新規範](../../instructions/form-validation.instructions.md)
- [Server-side 資料補償規範](../../instructions/server-side.instructions.md)
- [自訂資源翻新指引](../../references/{resourceName}.md)

---

#### R2-1: Quasar 元件替換

識別：`<table>`, `<input>`, `<textarea>`, `<select>`，參照 [Quasar 元件轉換規範](../../instructions/quasar-components.instructions.md)。

---

#### R2-2: 表單驗證技術棧翻新

識別：頁面引用 `CM/js/ui/validation.js`，參照 [表單驗證翻新規範](../../instructions/form-validation.instructions.md) 翻新為 VeeValidate + Yup + Quasar。

---

#### R2-3: Server-side 資料來源識別與補償

識別：以下後端注入語法，參照 [Server-side 資料補償規範](../../instructions/server-side.instructions.md)。

- `${xxx}`（EL 表達式）
- `<%=request.getParameter("xxx")%>`
- `<%=request.getAttribute("xxx")%>`
- `<%=session.getAttribute("xxx")%>`
- `<%=application.getAttribute("xxx")%>`
- `<%=xxx%>`（JSP Scriptlet 輸出）
- `<c:set var="xxx">` 來自後端的值

**Exception**：`${param.xxx}` 依 R1 直接翻新為 `route.query.xxx`，不走 Server-side 補償。

---

#### R2-4: 自訂資源

識別：以下項目視為自訂資源，依 [自訂資源翻新指引](../../instructions/jsp/{resourceName}.md) 翻新，無對應文件則 Fallback。

- 外部 `.js` 檔案引用的函式（`CSRUtil.*`、`PageUI.*`、`Date.toROC()` 等）
- non-core Taglib（`cathay:*`、`dz:*`、`CXL:*`、`fmt:*`）
- JSP include（`<%@ include file="..."%>`）
- Java 類別呼叫（`DateUtil.*`、`StringUtils.*` 等）

---

### R3: Fallback 規則

以下情境必須套用 Fallback 處理，不得推論實作：
- 自訂資源無對應轉換規範文件（`.github/instructions/jsp/{resourceName}.md`）
- 無等價技術棧

**Fallback 模式**：於 `<script setup>` 最底部統一定義 composable，方法名稱必須對應原始資源方法名稱：

```js
const use{ResourceName} = () => {
  // 若可觀察到包裹子元素：透傳 slot
  template: '<slot />'
  // 無傳入值
  const methodName = () => void
  // 函式型（有傳入值）：傳入值直接回傳
  const methodName = (arg) => arg ?? null
  return { methodName }
}
```

- **FORBIDDEN**：禁止實作 composable 內部邏輯

---

### R4: 註解規範

| 註解 | 語義 | 使用時機 |
|---|---|---|
| `// FIXME: xxx` | 此處有改寫，需人工確認邏輯等價 | 所有重構點 |
| `// TODO: xxx` | 此處未還原，有行為缺失 | 無法翻新的項目 |

---

## Workflow

**Step 1: 分析與決策**

掃描 JSP 識別所有 R2 項目，確認翻新邊界，依 template 產出分析報告：
- Template：`.github/skills/jsp-renovator/templates/analysis-report-template.md`
- 產出路徑：`.github/ir/analysis/{FileName}-analysis.md`

**REQUIRED**：
- 分析報告必須完整填寫，Step 2～4 以分析報告為唯一執行依據，不得再重新解讀 JSP
- 表一「具體產出」欄位必須寫明到實作層級（元件名稱、ref 名稱、schema key 等），不得只寫規範文件名稱

---

**Step 2: 建立 Fallback Composables**
- 依 分析報告 表二，於 `<script setup>` 建立所有 Fallback composable 並以 `// region` + `// endregion` 包裹 composable 定義區塊
- 方法名稱必須對應表二原始方法名稱
- 確保後續翻新步驟可直接引用

**Step 3: R1 直接翻新**
- 依 R1 規範逐行翻新所有語義已知項目

**Step 4: R2 規範翻新**
- 依 分析報告 表一與對應規範文件逐項翻新
- 僅處理表一列出的項目，不得自行新增

**Step 5: 驗證**
- 對照 Evaluation Checklist 逐項確認
- 若發現語法錯誤：
  1. 查找對應規範文件是否有處理方式
  2. 有規範 THEN 依規範修正
  3. 無規範 THEN 標記 TODO，不得自行推論修正

---

## Evaluation Checklist

- [ ] **業務邏輯還原**
  - [ ] JSP 內部所有業務邏輯均有對應 Vue 實作或標記
  - [ ] 未參照其他頁面寫法新增不存在的頁面規格
  - [ ] 未主動優化或簡化原始業務邏輯

- [ ] **技術棧翻新**
  - [ ] 所有 R1 項目已逐行翻新，無遺漏
  - [ ] 所有 R2 項目已依對應規範文件翻新
  - [ ] 規範文件以外無行為改變

- [ ] **Fallback 處理**
  - [ ] 所有自訂資源已依 Step 1 表二建立 Fallback composable
  - [ ] Fallback composable 方法名稱與原始資源方法名稱一致
  - [ ] Fallback composable 未實作內部邏輯

- [ ] **版面與結構**
  - [ ] 原始 HTML 版面結構完整保留
  - [ ] 原始 HTML 元素的 class attribute 完整保留，未新增或移除
  - [ ] 廢棄 HTML 屬性已改為 `:style` binding

- [ ] **標記完整性**
  - [ ] 所有重構點已標記 FIXME
  - [ ] 所有未還原項目已標記 TODO

- [ ] **產出完整性**
  - [ ] Vue SFC 語法結構正確，無語法錯誤
  - [ ] 路由已更新
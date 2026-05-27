# PageUI.js 翻新指引

## Core Principles

**REQUIRED**：
- JSP 中 `PageUI.createPage(...)` 呼叫一律翻新為 `<PageUI>` 元件包裹頁面內容
- `PageUI.createContent(...)` 產生的表單區塊改為 `<PageUI>` 的 `default slot`，欄位改用 Quasar 元件直接排版
- `JsUtils.*` DOM 工具函式全部直接移除，改用 Vue 原生語法

**FORBIDDEN**：
- 禁止在翻新後的 Vue 頁面中保留任何 `PageUI.*` / `JsUtils.*` 呼叫
- `createInput` 動態產生 input DOM 的模式一律改為 Quasar 元件（`q-input`、`q-select` 等）

---

## Rules

### 翻新對應速查表

**封裝元件**：`PageUI`（`@/components/layout/PageUI.vue`）

#### `PageUI.createPage(pageNO, title, subTitleText)` → `<PageUI>` props

| 原始參數 | 翻新 prop |
|---|---|
| `title` | `:title="'主標題'"` |
| `subTitleText` | `:sub-title="'副標題'"` |
| `pageNO` | `:page-no="'DSZ01000'"` |
| `noPageFrame: true` | `:no-frame="true"` |

```vue
<!-- 原始 JSP -->
<!-- PageUI.createPage('DSZ01000', '交易查詢', '查詢條件') -->

<!-- 翻新 -->
<PageUI title="交易查詢" sub-title="查詢條件" page-no="DSZ01000">
  <!-- 頁面內容 -->
</PageUI>
```

---

#### `PageUI.createContent(config, loadinValues, showType)` → `<PageUI>` slot + Quasar

| 原始 showType | 翻新 `:mode` prop |
|---|---|
| `0` | `'input'`（輸入模式） |
| `1` | `'display'`（顯示模式，預設） |

```vue
<PageUI
  title="基本資料"
  sub-title="查詢條件"
  :mode="mode"
>
  <!-- createContent 的欄位改為 Quasar 元件 -->
  <div class="row q-gutter-sm">
    <q-input v-model="form.NAME" label="姓名" outlined dense />
    <q-input v-model="form.BIRTH_DATE" label="生日" outlined dense />
    <q-select v-model="form.DEPT" :options="deptOpts" label="部門" outlined dense />
  </div>
</PageUI>
```

---

#### `PageUI.setContentsDisplay(content, displayType)` → `setMode()`

```vue
<script setup>
import { ref } from 'vue'
const pageRef = ref(null)
const mode = ref('display')

// 原始：PageUI.setContentsDisplay(content, 0)
const switchToInput = () => {
  mode.value = 'input'
  // 或透過 ref 呼叫
  // pageRef.value?.setMode('input')
}

// 原始：PageUI.setContentsDisplay(content, 1)
const switchToDisplay = () => {
  mode.value = 'display'
}
</script>

<template>
  <PageUI ref="pageRef" title="基本資料" :mode="mode">
    <!-- 頁面依 mode 自行以 v-if / :disable 控制欄位狀態 -->
    <q-input
      v-model="form.NAME"
      label="姓名"
      outlined
      dense
      :readonly="mode === 'display'"
    />
  </PageUI>
</template>
```

---

#### `PageUI.setSubTitle(text)` → `setSubTitle()`

```vue
<script setup>
const pageRef = ref(null)

// 原始：PageUI.setSubTitle('查詢結果')
pageRef.value?.setSubTitle('查詢結果')
</script>

<template>
  <PageUI ref="pageRef" title="交易查詢" sub-title="查詢條件" />
</template>
```

---

#### `PageUI.getContentValues` / `setContentValues` → 直接操作 reactive 物件

```js
// 原始：PageUI.getContentValues(content)
const values = form  // 直接讀取 reactive form 物件

// 原始：PageUI.setContentValues(content, values)
Object.assign(form, apiResponse)

// 原始：PageUI.rollbackContentValues(content)
Object.assign(form, savedForm)  // 自行儲存舊值後還原
```

---

#### `JsUtils` 工具函式 → 直接移除

| 原始呼叫 | 處理方式 |
|---|---|
| `PageUI.setButtonsEnable(div, ['QUERY'])` | 直接移除，改用 `:disable="..."` binding |
| `PageUI.createButtonArea(content, buttonConfig)` | 直接移除，改用 `q-btn` 自行排版 |
| `JsUtils.getDOM(id)` | 直接移除，改用 `ref` 或 Vue 原生存取 |
| `JsUtils.isArray / isObject / ...` | 直接移除，改用原生 `Array.isArray()` 等 |
| `window.init()` | 直接移除，改用 `onMounted` |

---

### `PageUI.vue` defineExpose API

| 方法 | 參數 | 說明 |
|---|---|---|
| `setSubTitle(text)` | `text: string` | 動態更新副標題（對應 `PageUI.setSubTitle`） |
| `setMode(mode)` | `'input'` \| `'display'` | 切換輸入/顯示模式（對應 `PageUI.setContentsDisplay`） |

---
description: JSP `PageUI.js` 舊用法遷移到 Vue3 + Quasar PageUI adapter 對照
---

# PageUI 語法轉換

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| PageUI API adapter | `import { usePageUIAdapter } from '@/assets/composables/usePageUIAdapter.js'` | `src/assets/composables/usePageUIAdapter.js` |
| PageUI layout 元件 | `import PageUILayout from '@/components/common/page/PageUILayout.vue'` | `src/components/common/page/PageUILayout.vue` |
| Vue ref/reactive | `import { ref } from 'vue'` | `vue` |

---

## API 轉換對照

| 舊語法（PageUI.js） | 新語法（Vue） | 引用路徑 |
|---|---|---|
| `PageUI.createPage(pageNO, title, subTitle, noPageFrame)` | `pageUI.createPage(pageNO, title, subTitle, noPageFrame)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.createPageWithAllBodySubElement(pageNO, title, subTitle, fixedNum, noPageFrame)` | `pageUI.createPageWithAllBodySubElement(pageNO, title, subTitle, fixedNum, noPageFrame)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.loadin(loadinConfigs, fixedNum)` | `pageUI.loadin(loadinConfigs, fixedNum)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.fixedContent(fixedNum)` | `pageUI.fixedContent(fixedNum)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.createContent(config, loadinValues, showType)` | `pageUI.createContent(config, loadinValues, showType)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setContentDisplay(content, displayType)` | `pageUI.setContentDisplay(content, displayType)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setContentsDisplay(content, displayType)` | `pageUI.setContentsDisplay(content, displayType)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.getContentValue(content, isForDisplay)` | `pageUI.getContentValue(content, key, isForDisplay)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setContentValue(content, value, isAutoCommit, clearValueWhenNotInValues)` | `pageUI.setContentValue(content, value, isAutoCommit, clearValueWhenNotInValues)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.getContentValues(content, isAutoCommit)` | `pageUI.getContentValues(content, isAutoCommit)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setContentValues(content, values, isAutoCommit, clearValueWhenNotInValues)` | `pageUI.setContentValues(content, values, isAutoCommit, clearValueWhenNotInValues)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.commitContentValue(content)` | `pageUI.commitContentValue(content)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.rollbackContentValue(content)` | `pageUI.rollbackContentValue(content)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.commitContentValues(content)` | `pageUI.commitContentValues(content)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.rollbackContentValues(content)` | `pageUI.rollbackContentValues(content)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.createButtonArea(content, buttonConfig)` | `pageUI.createButtonArea(content, buttonConfig)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setButtonsEnable(buttonContent, enableArray, skipCheck)` | `pageUI.setButtonsEnable(buttonAreaId, enableArray, skipCheck)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.setSubTitle(subTitleText)` | `pageUI.setSubTitle(subTitleText)` | `src/assets/composables/usePageUIAdapter.js` |
| `PageUI.resize()` | `pageUI.resize()` | `src/assets/composables/usePageUIAdapter.js` |

---

## 元件掛載方式

| 舊語法 | 新語法 | 引用路徑 |
|---|---|---|
| PageUI DOM 動態建構頁面骨架 | 在頁面 template 掛載 `<PageUILayout ...>` | `src/components/common/page/PageUILayout.vue` |
| `contentDiv` 區塊 append child | `blocks` + `<component :is="..." />` 注入子區塊 | `src/components/common/page/PageUILayout.vue` |

---

## 標準使用片段

```vue
<script setup>
import { usePageUIAdapter } from '@/assets/composables/usePageUIAdapter.js'
import PageUILayout from '@/components/common/page/PageUILayout.vue'

const pageUI = usePageUIAdapter()

pageUI.createPage('DSA30900', '主功能', '查詢條件', false)
pageUI.loadin([
  {
    id: 'queryBlock',
    title: '查詢條件',
    component: null,
  },
], 1)
</script>

<template>
  <PageUILayout
    :page-no="pageUI.state.pageMeta.pageNo"
    :title="pageUI.state.pageMeta.title"
    :sub-title="pageUI.state.pageMeta.subTitle"
    :no-page-frame="pageUI.state.pageMeta.noPageFrame"
    :blocks="pageUI.state.loadinBlocks"
    :fixed-num="pageUI.state.fixedNum"
  />
</template>
```

---

## 未完整還原

| 舊語法能力 | 新語法 |
|---|---|
| `createPageWithAllBodySubElement` 自動掃描 body 子節點 | - |
| 直接 DOM 操作（`appendChild` / `setAttribute`）行為 | - |
| IE 專用 documentMode / expression 版面邏輯 | - |

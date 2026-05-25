---
description: JSP `popupWin.js` 舊用法遷移到 Vue3 + Quasar Dialog 對照
---

# popupWin 語法轉換

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| popupWin API adapter | `import { usePopupWinAdapter } from '@/assets/composables/usePopupWinAdapter.js'` | `src/assets/composables/usePopupWinAdapter.js` |
| popupWin 視覺容器 | `import PopupWinDialog from '@/components/common/modals/PopupWinDialog.vue'` | `src/components/common/modals/PopupWinDialog.vue` |
| Vue ref/reactive | `import { ref } from 'vue'` | `vue` |

---

## API 轉換對照

| 舊語法（popupWin.js） | 新語法（Vue） | 引用路徑 |
|---|---|---|
| `popupWin.popup(config)` | `popupWin.popup(config)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.popup(url, w, h, l, t, scrolling, params)` | `popupWin.popup(url, w, h, l, t, scrolling, params)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.fullPopup(config)` | `popupWin.fullPopup(config)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.close()` | `popupWin.close()` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.back(...args)` | `popupWin.back(...args)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.windowOpen(url, opts)` | `popupWin.windowOpen(url, opts)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.createPopupLink(text, config)` | `popupWin.createPopupLink(text, config)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.createPopupButton(text, config)` | `popupWin.createPopupButton(text, config)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.createFullPopupLink(text, config)` | `popupWin.createFullPopupLink(text, config)` | `src/assets/composables/usePopupWinAdapter.js` |
| `popupWin.createFullPopupButton(text, config)` | `popupWin.createFullPopupButton(text, config)` | `src/assets/composables/usePopupWinAdapter.js` |

---

## 元件掛載方式

| 舊語法 | 新語法 | 引用路徑 |
|---|---|---|
| 舊版 DOM 動態建構 popup window | 在頁面 template 掛載 `<PopupWinDialog ... />` | `src/components/common/modals/PopupWinDialog.vue` |
| iframe page 呼叫 `popupWinBack(...)` / `popupWinclose()` | 在 iframe 中呼叫 `window.popupWinBack(...)` / `window.popupWinclose()` | `src/components/common/modals/PopupWinDialog.vue` |

---

## 標準使用片段

```vue
<script setup>
import { usePopupWinAdapter } from '@/assets/composables/usePopupWinAdapter.js'
import PopupWinDialog from '@/components/common/modals/PopupWinDialog.vue'

const popupWin = usePopupWinAdapter()

function openQuery() {
  popupWin.popup({
    src: '/dispatcher/XXA0_0100/query',
    title: '查詢視窗',
    width: 0.9,
    height: 0.8,
    parameters: { QUERY_KEY: 'TEST' },
  })
}
</script>

<template>
  <q-btn label="Open" @click="openQuery" />

  <PopupWinDialog
    v-model="popupWin.state.visible"
    :src="popupWin.state.src"
    :title="popupWin.state.title"
    :width="popupWin.state.width"
    :height="popupWin.state.height"
    :parameters="popupWin.state.parameters"
    :scrolling="popupWin.state.scrolling"
    :full-popup="popupWin.state.fullPopup"
    :close-btn="popupWin.state.closeBtn"
    :close-confirm="popupWin.state.closeConfirm"
    @back="popupWin.onDialogBack"
    @close="popupWin.close"
  />
</template>
```

---

## 未完整還原

| 舊語法能力 | 新語法 |
|---|---|
| popupWin 拖曳 + 8 向縮放 | - |
| legacy Prototype 事件橋接 | - |

> 目前直接移除*未完整還原*的功能，不需特別註解說明缺口

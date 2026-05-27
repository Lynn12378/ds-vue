# popupWin/callback.md — 子頁面回呼機制

## 背景

原始 popupWin.js 在 iframe load 後將 `window.popupWinBack` 與 `window.popupWinclose` 注入至 iframe 的 `contentWindow`，子頁面呼叫這兩個方法回呼父頁面。

翻新後，子頁面不再是 iframe，而是直接以 Vue 元件渲染在 `CustomPopup` 的 default slot 內。

---

## 翻新策略

### 方式一（推薦）：子元件 emit

子元件透過 `emit('back', payload)` 通知父頁面，父頁面在 `CustomPopup` 的 slot 中接收：

```vue
<!-- 父頁面 -->
<CustomPopup v-model="showPopup" title="查詢" @back="onPopupBack">
  <MyChildComponent @back="onChildBack" />
</CustomPopup>

<script setup>
const showPopup = ref(false)
const onChildBack = (payload) => {
  // 處理子元件回傳的資料
  showPopup.value = false
}
</script>
```

```vue
<!-- 子元件 MyChildComponent.vue -->
<script setup>
const emit = defineEmits(['back'])
const onConfirm = () => {
  emit('back', { FIELD_A: valueA, FIELD_B: valueB })
}
</script>
```

---

### 方式二：相容 `window.popupWinBack`（適用尚未翻新的子頁面）

若子頁面尚未翻新，仍呼叫 `window.popupWinBack(payload)`，`CustomPopup` 在開啟時會自動將此方法注入至 `window`，子頁面呼叫後觸發父頁面的 `@back` event：

```vue
<!-- 父頁面 -->
<CustomPopup v-model="showPopup" @back="onPopupBack">
  <!-- 子頁面仍可呼叫 window.popupWinBack(payload) -->
</CustomPopup>

<script setup>
const onPopupBack = (payload) => {
  console.log('回呼資料', payload)
}
</script>
```

子頁面（未翻新）保持原始呼叫方式：

```js
// 子頁面 JSP/JS 原始程式碼（不需修改）
window.popupWinBack({ KEY: value });
```

**注意**：`CustomPopup` 關閉後會自動清除 `window.popupWinBack`，多個 `CustomPopup` 同時顯示時可能產生衝突，建議盡快以方式一替換。

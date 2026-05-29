<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** 頁面主標題（對應 createPage 的 title） */
  title: {
    type: String,
    required: true,
  },
  /** 頁面副標題（對應 createPage 的 subTitleText） */
  subTitle: {
    type: String,
    default: '',
  },
  /** 頁面編號（對應 createPage 的 pageNO） */
  pageNo: {
    type: String,
    default: '',
  },
  /** 是否不產生外框（對應 createPage 的 noPageFrame） */
  noFrame: {
    type: Boolean,
    default: false,
  },
  /** 欄位顯示模式（對應 setContentsDisplay 的 displayType）
   *  'input'   → 輸入模式（displayType = 0）
   *  'display' → 顯示模式（displayType = 1，預設）
   */
  mode: {
    type: String,
    default: 'display',
    validator: (v) => ['input', 'display'].includes(v),
  },
})

// ── 副標題動態更新（對應 PageUI.setSubTitle）────────────────────────────────
const currentSubTitle = ref(props.subTitle)

defineExpose({
  /** 動態更新副標題（對應 PageUI.setSubTitle(text)） */
  setSubTitle: (text) => {
    currentSubTitle.value = text
  },
})
</script>

<template>
  <!-- ── 有外框版面（noPageFrame = false，預設）──────────────────────────── -->
  <div v-if="!noFrame" class="custom-page">

    <!-- 標題列（對應 titleBar） -->
    <div class="custom-page__title-bar">
      <div class="custom-page__title">
        <span class="custom-page__title-dot">◆</span>
        {{ title }}
      </div>
      <div v-if="pageNo" class="custom-page__page-no">
        畫面編號：{{ pageNo }}
      </div>
    </div>

    <!-- 副標題列（對應 contentsTh） -->
    <div class="custom-page__sub-title">
      <span class="custom-page__sub-title-dot">❖</span>
      {{ currentSubTitle }}
    </div>

    <!-- 內容區（對應 contentDiv） -->
    <div class="custom-page__content" :data-mode="mode">
      <slot></slot>
    </div>

  </div>

  <!-- ── 無外框版面（noPageFrame = true）────────────────────────────────── -->
  <div v-else class="custom-page custom-page--no-frame">
    <div class="custom-page__content" :data-mode="mode">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.custom-page {
  /* TODO: 對應原始 PageUI table 外框樣式（cm.css） */
  min-height: 100%;
}

.custom-page__title-bar {
  /* TODO: 對應原始 titleBar / borderText 樣式 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background-color: #F0FBC6;
}

.custom-page__title {
  font-weight: bold;
}

.custom-page__title-dot {
  color: #5A99B9;
  margin-right: 4px;
}

.custom-page__page-no {
  font-size: 0.85rem;
  color: #666;
}

.custom-page__sub-title {
  /* TODO: 對應原始 contentsTh 樣式 */
  padding: 4px 8px;
  font-weight: bold;
}

.custom-page__sub-title-dot {
  color: #5A99B9;
  margin-right: 4px;
}

.custom-page__content {
  padding: 8px;
}
</style>

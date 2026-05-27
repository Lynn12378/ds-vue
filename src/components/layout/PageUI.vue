<script setup>
/**
 * PageUI.vue — PageUI.js 翻新
 *
 * 職責：
 * 1. 渲染頁面外框（主標題、副標題、頁碼）
 * 2. 提供 mode（input/display）prop 供頁面切換輸入/顯示狀態
 * 3. expose setSubTitle / setMode 供頁面程式呼叫
 *
 * 使用方式：
 * ```vue
 * <PageUI title="交易查詢" sub-title="查詢條件" page-no="DSZ01000" :mode="mode">
 *   <!-- 頁面表單內容放在 default slot -->
 * </PageUI>
 * ```
 *
 * defineExpose 公開 API：
 * - setSubTitle(text)   — 對應 PageUI.setSubTitle(text)
 * - setMode(mode)       — 對應 PageUI.setContentsDisplay(content, displayType)
 *                         'input'   → showType: 0
 *                         'display' → showType: 1
 */

import { ref, computed } from 'vue'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps({
  /**
   * 頁面主標題（對應 createPage 的 title 參數）
   * 顯示於標題列左側，JSP 對應 `document.title` 與標題列文字
   */
  title: {
    type: String,
    default: '',
  },

  /**
   * 頁面副標題（對應 createPage 的 subTitleText 參數）
   * 顯示於內容區上方說明列，可由 setSubTitle() 動態更新
   */
  subTitle: {
    type: String,
    default: '',
  },

  /**
   * 頁面代碼（對應 createPage 的 pageNO 參數）
   * 顯示於標題列右側
   */
  pageNo: {
    type: String,
    default: '',
  },

  /**
   * 顯示模式（對應 createContent 的 showType 參數）
   * 'input'   → showType: 0（輸入模式）
   * 'display' → showType: 1（顯示模式）
   * 頁面透過 :mode 控制，子元件以 inject('pageMode') 取得
   */
  mode: {
    type: String,
    default: 'display',
    validator: (v) => ['input', 'display'].includes(v),
  },

  /**
   * 是否隱藏外框（對應 createPage 的 noPageFrame 參數）
   * true → 只渲染內容區，不顯示標題外框
   */
  noFrame: {
    type: Boolean,
    default: false,
  },
})

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits([
  /** 副標題更新（供父層 v-model:sub-title 使用） */
  'update:subTitle',
  /** 模式切換（供父層 v-model:mode 使用） */
  'update:mode',
])

// ─── 內部狀態 ─────────────────────────────────────────────────────────────────

/**
 * 副標題內部狀態（可由 setSubTitle 更新，也可由 prop 控制）
 * 對應 JSP createPage 產生的 subTitle span
 */
const internalSubTitle = ref(props.subTitle)

// ─── 公開 API ─────────────────────────────────────────────────────────────────

/**
 * 動態更新副標題文字
 * 對應 JSP：PageUI.setSubTitle(subTitleText)
 * @param {string} text
 */
function setSubTitle(text) {
  internalSubTitle.value = text
  emit('update:subTitle', text)
}

/**
 * 切換輸入/顯示模式
 * 對應 JSP：PageUI.setContentsDisplay(content, displayType)
 *   'input'   → displayType: 0
 *   'display' → displayType: 1
 * @param {'input'|'display'} mode
 */
function setMode(mode) {
  emit('update:mode', mode)
}

// ─── defineExpose ─────────────────────────────────────────────────────────────

defineExpose({
  /**
   * 動態更新副標題
   * 對應 PageUI.setSubTitle(text)
   */
  setSubTitle,

  /**
   * 切換輸入/顯示模式
   * 對應 PageUI.setContentsDisplay(content, 0/1)
   * @param {'input'|'display'} mode
   */
  setMode,
})
</script>

<template>
  <div class="page-ui">

    <!-- 頁面外框（對應 createPage noPageFrame=false 的標題列） -->
    <template v-if="!noFrame">
      <div class="page-ui__title-bar row items-center no-wrap q-px-sm q-py-xs">
        <span class="page-ui__title text-weight-bold">
          ◆ {{ title }}
        </span>
        <q-space />
        <span v-if="pageNo" class="page-ui__page-no text-caption text-grey-7">
          頁面代碼：{{ pageNo }}
        </span>
      </div>
    </template>

    <!-- 內容區（對應 createContent 產生的 contentDiv） -->
    <div class="page-ui__content">

      <!-- 副標題列（對應 createContent 產生的 contentsTh） -->
      <div v-if="internalSubTitle || subTitle" class="page-ui__sub-title q-px-sm q-py-xs">
        <span class="text-primary">
          {{ internalSubTitle || subTitle }}
        </span>
      </div>

      <!-- 頁面表單內容（對應 PageUI.loadin 搬入的 DOM，翻新後改為 slot） -->
      <div class="page-ui__body q-pa-sm">
        <slot />
      </div>

    </div>

  </div>
</template>

<style scoped>
.page-ui {
  width: 100%;
}

/* 對應 JSP titleBar */
.page-ui__title-bar {
  background: #f0fbc6;
  border-bottom: 1px solid #c8e6a0;
  min-height: 32px;
}

.page-ui__title {
  font-size: 14px;
  color: #333;
}

.page-ui__page-no {
  white-space: nowrap;
}

/* 對應 JSP contentsTh */
.page-ui__sub-title {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  min-height: 28px;
  display: flex;
  align-items: center;
}

.page-ui__body {
  width: 100%;
}
</style>

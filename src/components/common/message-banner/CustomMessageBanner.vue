<template>
  <q-card-section v-if="messages.length > 0" class="q-gutter-sm">
    <q-banner
      v-for="item in messages"
      :key="buildMessageKey(item)"
      dense
      inline-actions
      rounded
      :class="resolveBannerClass(item.level)"
    >
      <div class="text-body2">{{ item.message }}</div>

      <div
        v-if="buildMetaText(item)"
        class="text-caption q-mt-xs"
      >
        {{ buildMetaText(item) }}
      </div>

      <div
        v-if="isDetailVisible(item)"
        class="custom-message-detail q-mt-xs"
      >
        {{ item.detail }}
      </div>

      <template #action>
        <q-btn
          v-if="hasDetail(item)"
          dense
          flat
          no-caps
          :label="getDetailToggleLabel(item)"
          @click="toggleDetail(item)"
        />
      </template>
    </q-banner>
  </q-card-section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
});

const openedMessageKeys = ref({});

/**
 * 產生訊息唯一鍵值。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {string} 訊息唯一鍵。
 */
function buildMessageKey(item) {
  return `${item?.createdAt || ""}-${item?.requestId || ""}-${item?.message || ""}`;
}

/**
 * 判斷訊息是否包含詳細內容。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {boolean} 是否有詳細內容。
 */
function hasDetail(item) {
  return typeof item?.detail === "string" && item.detail.trim() !== "";
}

/**
 * 建立訊息附加資訊文字。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {string} 附加資訊文字。
 */
function buildMetaText(item) {
  const metaItems = [];

  if (item?.errorCode) {
    metaItems.push(`錯誤代碼 ${item.errorCode}`);
  }

  if (item?.systemId) {
    metaItems.push(`系統 ${item.systemId}`);
  }

  if (item?.code !== null && item?.code !== undefined) {
    metaItems.push(`returnCode ${item.code}`);
  }

  return metaItems.join(" | ");
}

/**
 * 判斷訊息詳情是否展開。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {boolean} 是否展開詳情。
 */
function isDetailVisible(item) {
  const key = buildMessageKey(item);
  return openedMessageKeys.value[key] === true;
}

/**
 * 切換訊息詳情展開狀態。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {void} 執行結果。
 */
function toggleDetail(item) {
  const key = buildMessageKey(item);
  openedMessageKeys.value = {
    ...openedMessageKeys.value,
    [key]: openedMessageKeys.value[key] !== true,
  };
}

/**
 * 取得詳情按鈕文字。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {string} 按鈕文字。
 */
function getDetailToggleLabel(item) {
  return isDetailVisible(item) ? "收合" : "詳情";
}

/**
 * 依訊息等級回傳對應的 Quasar 樣式 class。
 * @param {string} level 訊息等級，例如 error、warning、success。
 * @returns {string} 對應樣式 class 字串。
 */
function resolveBannerClass(level) {
  if (level === "error") {
    return "bg-red-1 text-negative";
  }

  if (level === "warning") {
    return "bg-orange-1 text-orange-10";
  }

  if (level === "success") {
    return "bg-green-1 text-positive";
  }

  return "bg-blue-1 text-primary";
}
</script>

<style scoped>
.custom-message-detail {
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.4;
}
</style>

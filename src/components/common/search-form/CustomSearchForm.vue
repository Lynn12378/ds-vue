<template>
  <q-form @submit.prevent="emitSubmit">
    <q-input
      v-model="localKeyword"
      dense
      outlined
      clearable
      label="關鍵字"
    />

    <div class="row q-col-gutter-sm q-mt-sm">
      <div>
        <q-btn
          color="primary"
          label="查詢"
          type="submit"
          :loading="loading"
        />
      </div>
      <div>
        <q-btn flat label="重設" @click="resetKeyword" />
      </div>
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  keyword: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "reset", "update:keyword"]);

const localKeyword = ref(props.keyword);

/**
 * 將外部 keyword 同步回本地輸入值，確保受控欄位一致。
 * @param {string} value 外部傳入的關鍵字。
 * @returns {void} 執行結果。
 */
function syncKeywordFromProps(value) {
  if (value !== localKeyword.value) {
    localKeyword.value = value;
  }
}

/**
 * 將本地關鍵字回寫給父層，維持雙向綁定。
 * @param {string} value 本地輸入值。
 * @returns {void} 執行結果。
 */
function syncKeywordToParent(value) {
  emit("update:keyword", value);
}

/**
 * 轉發 submit 事件給父層。
 * @returns {void} 執行結果。
 */
function emitSubmit() {
  emit("submit");
}

/**
 * 清空關鍵字並通知父層執行重設流程。
 * @returns {void} 執行結果。
 */
function resetKeyword() {
  localKeyword.value = "";
  emit("reset");
}

watch(
  () => props.keyword,
  syncKeywordFromProps
);

watch(localKeyword, syncKeywordToParent);
</script>

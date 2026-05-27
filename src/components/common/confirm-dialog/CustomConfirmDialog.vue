<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card
      class="custom-confirm-dialog__card"
      v-dialog-draggable="dialogDragOptions"
      v-dialog-resizable="dialogResizeOptions"
    >
      <q-card-section class="text-subtitle1 custom-confirm-dialog__title">{{ title }}</q-card-section>
      <q-card-section>{{ message }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" @click="emitCancel" />
        <q-btn color="primary" flat label="確認" @click="emitConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import {
  dialogDraggableDirective,
  dialogResizableDirective,
} from "@/directives/dialogFloating.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "提示",
  },
  message: {
    type: String,
    default: "",
  },
  draggable: {
    type: Boolean,
    default: true,
  },
  resizable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);
const vDialogDraggable = dialogDraggableDirective;
const vDialogResizable = dialogResizableDirective;

const dialogDragOptions = computed(() => ({
  enabled: props.draggable,
  handle: ".custom-confirm-dialog__title",
}));

const dialogResizeOptions = computed(() => ({
  enabled: props.resizable,
  minWidth: 320,
  minHeight: 180,
}));

/**
 * 取得目前 dialog 顯示狀態。
 * @returns {boolean} 是否顯示 dialog。
 */
function getDialogVisible() {
  return props.modelValue;
}

const dialogVisible = computed({
  get: getDialogVisible,
  set: emitModelValue,
});

/**
 * 更新 dialog 顯示狀態。
 * @param {boolean} value 是否顯示 dialog。
 * @returns {void} 執行結果。
 */
function emitModelValue(value) {
  emit("update:modelValue", value);
}

/**
 * 轉發確認事件。
 * @returns {void} 執行結果。
 */
function emitConfirm() {
  emit("confirm");
}

/**
 * 轉發取消事件。
 * @returns {void} 執行結果。
 */
function emitCancel() {
  emit("cancel");
}
</script>

<style scoped>
.custom-confirm-dialog__card {
  min-width: 320px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 24px);
  overflow: auto;
}

.custom-confirm-dialog__title {
  user-select: none;
}
</style>

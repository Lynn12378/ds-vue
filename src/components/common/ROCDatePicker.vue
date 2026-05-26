<script setup>
import { computed } from 'vue'
import useCommon from '@/assets/utils/common.js'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const common = useCommon()

// 內部：q-date 綁定西元 YYYYMMDD
const ceDate = computed({
  get: () => {
    if (!props.modelValue || props.modelValue.length < 7) return ''
    return common.tranCEorROCDate(props.modelValue, 'ceDate')
  },
  set: (val) => {
    if (!val) {
      emit('update:modelValue', '')
      return
    }
    emit('update:modelValue', common.tranCEorROCDate(val, 'rocDate'))
  }
})

// header title：民國 114/12/25
const rocTitle = computed(() => {
  if (!ceDate.value || ceDate.value.length < 8) return ''
  const y = Number(ceDate.value.substring(0, 4)) - 1911
  const m = ceDate.value.substring(4, 6)
  const d = ceDate.value.substring(6, 8)
  return `民國 ${y}/${m}/${d}`
})

// header subtitle：民國 114 年（點擊可切換年份選擇視圖）
const rocSubtitle = computed(() => {
  if (!ceDate.value || ceDate.value.length < 4) return '選擇年份'
  return `民國 ${Number(ceDate.value.substring(0, 4)) - 1911} 年`
})
</script>

<template>
  <!--
    ROCDatePicker
    - 對外 v-model：民國格式 YYYMMDD，例：'1141225'
    - 對內 q-date：西元格式 YYYYMMDD，header 顯示民國年
    - 日曆格內日期數字為西元（q-date 限制，無法修改）
    - 其餘 q-date props（options、readonly、disable 等）透過 $attrs 透傳
  -->
  <q-date
    v-model="ceDate"
    mask="YYYYMMDD"
    :title="rocTitle"
    :subtitle="rocSubtitle"
    v-bind="$attrs"
  />
</template>

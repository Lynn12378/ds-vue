<template>
  <!--
    浮水印（對應 header.jsp WatermarkPlus 邏輯）
    isWaterMark=true + 登入者 CATHAY_NO/empName + 登入時間戳
  -->
  <div
    v-if="visible"
    class="fixed full-width full-height no-pointer-events overflow-hidden row wrap q-gap-xl"
    aria-hidden="true"
    style="z-index: 9000; opacity: 0.07; transform: rotate(-17deg); padding: 20px"
  >
    <span
      v-for="n in 40"
      :key="n"
      class="text-black"
      style="font-size: 13px; white-space: nowrap; font-family: 'Microsoft JhengHei', sans-serif"
    >{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  /** 格式："{CATHAY_NO} {yyyy-MM-dd HH:mm:ss}" */
  text: { type: String, default: '' },
})
</script>

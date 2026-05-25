<template>
  <q-layout view="hHh LpR fFf">
    <BaseHeader
      :user-name="header.userName"
      :has-errors="message.hasErrors"
      @toggle-drawer="drawerOpen = !drawerOpen"
      @logout="$router.push('/')"
    />
    <BaseSidePanel v-model="drawerOpen" />
    <q-page-container>
      <BaseWaterMark :visible="header.isWaterMark" :text="header.watermarkText" />
      <router-view />
    </q-page-container>
    <BaseFooter />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useHeaderStore } from '@/stores/headerStore'
import { useMessageStore } from '@/stores/messageStore'
import BaseHeader from './base-layout/BaseHeader.vue'
import BaseSidePanel from './base-layout/BaseSidePanel.vue'
import BaseWaterMark from './base-layout/BaseWaterMark.vue'
import BaseFooter from './base-layout/BaseFooter.vue'

const drawerOpen = ref(true)
const header = useHeaderStore()
const message = useMessageStore()
</script>

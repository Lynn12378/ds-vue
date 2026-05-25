<template>
  <q-header>
    <q-toolbar>
      <q-btn icon="menu" @click="emit('toggle-drawer')" />
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>
      <q-space />
      <span v-if="userName">
        {{ userName }}
      </span>
      <q-btn icon="notifications">
        <q-badge v-if="hasErrors" color="negative" floating>!</q-badge>
      </q-btn>
      <q-btn icon="logout" @click="emit('logout')" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '業務系統' },
  userName: { type: String, default: '' },
  hasErrors: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-drawer', 'logout'])
</script>

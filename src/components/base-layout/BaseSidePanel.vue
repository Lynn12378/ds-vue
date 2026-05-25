<template>
  <q-drawer v-model="model" show-if-above bordered :width="220">
    <q-scroll-area class="fit">
      <q-tree
        :nodes="navNodes"
        node-key="key"
        label-key="label"
        icon-key="icon"
        default-expand-all
        selected-color="green-9"
        @lazy-load="onLazyLoad"
      >
        <template #default-header="{ node }">
          <q-item
            :to="node.to"
            clickable
            active-class="bg-green-2 text-green-9"
          >
            <q-item-section avatar>
              <q-icon :name="node.icon" size="xs" />
            </q-item-section>
            <q-item-section>{{ node.label }}</q-item-section>
          </q-item>
        </template>
      </q-tree>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { navNodes } from '@/router/navigation.js'

const model = defineModel({ type: Boolean, default: true })

function onLazyLoad({ node, key, done, fail }) {
  done(node.children ?? [])
}
</script>

<script setup>
import { computed, ref } from 'vue'
import CustomTable from '@/components/common/custom-table/CustomTable.js'

const columns = [
  { name: 'SEQ', label: '序號', field: 'SEQ', align: 'center', sortable: true },
  { name: 'DEPT', label: '部門', field: 'DEPT', align: 'left', sortable: true },
  { name: 'NAME', label: '姓名', field: 'NAME', align: 'left', sortable: true },
  { name: 'AMOUNT', label: '金額', field: 'AMOUNT', align: 'right', sortable: true },
  { name: 'STATUS', label: '狀態', field: 'STATUS', align: 'center', sortable: true }
]

const headerRows = [
  [
    { label: '序號', field: 'SEQ', rowspan: 2 },
    { label: '部門', field: 'DEPT', rowspan: 2 },
    { label: '人員資訊', colspan: 1 },
    { label: '流程資訊', colspan: 2 }
  ],
  [
    { label: '姓名', field: 'NAME' },
    { label: '金額', field: 'AMOUNT' },
    { label: '狀態', field: 'STATUS' }
  ]
]

const rows = ref([
  { id: 1, SEQ: 1, DEPT: '資訊部', NAME: '王小明', AMOUNT: 3500, STATUS: '草稿' },
  { id: 2, SEQ: 2, DEPT: '資訊部', NAME: '陳美華', AMOUNT: 5800, STATUS: '審核中' },
  { id: 3, SEQ: 3, DEPT: '資訊部', NAME: '林家豪', AMOUNT: 9200, STATUS: '已核准' },
  { id: 4, SEQ: 4, DEPT: '財務部', NAME: '黃佳玲', AMOUNT: 4700, STATUS: '審核中' },
  { id: 5, SEQ: 5, DEPT: '財務部', NAME: '周冠宇', AMOUNT: 3330, STATUS: '已結案' }
])

const enableHeaderRows = ref(true)
const enableGroupMerge = ref(true)
const enableStickyColumns = ref(true)
const selectedRows = ref([])

const activeHeaderRows = computed(() => (enableHeaderRows.value ? headerRows : []))
const activeGroupKeys = computed(() => (enableGroupMerge.value ? ['DEPT'] : []))
const activeStickyColumns = computed(() => (enableStickyColumns.value ? ['SEQ', 'DEPT'] : []))
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">TableUI.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/TableUI.js</div>
        <div class="text-body2 q-mt-sm">驗收重點：多列 Header、groupKey 合併、sticky 固定欄、勾選行。</div>
      </q-card-section>
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-12 col-md-auto">
          <q-toggle v-model="enableHeaderRows" label="多列 Header" />
        </div>
        <div class="col-12 col-md-auto">
          <q-toggle v-model="enableGroupMerge" label="groupKey 合併" />
        </div>
        <div class="col-12 col-md-auto">
          <q-toggle v-model="enableStickyColumns" label="sticky 固定欄" />
        </div>
      </q-card-section>
    </q-card>

    <CustomTable
      title="TableUI Demo"
      row-key="id"
      :rows="rows"
      :columns="columns"
      :header-rows="activeHeaderRows"
      :group-keys="activeGroupKeys"
      :sticky-columns="activeStickyColumns"
      selection="multiple"
      v-model:selected="selectedRows"
    >
      <template #body-cell-AMOUNT="scope">
        <q-td :props="scope" class="text-right text-weight-medium">
          {{ Number(scope.value).toLocaleString('zh-TW') }}
        </q-td>
      </template>
    </CustomTable>
  </div>
</template>
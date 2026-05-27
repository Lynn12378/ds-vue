<script setup>
const demoItems = [
  {
    title: 'TableUI.js',
    path: '/demo/table-ui',
    summary: '驗收 TableUI 核心行為：多列表頭、群組合併、固定欄、勾選。'
  },
  {
    title: 'PageUI.js',
    path: '/demo/page-ui',
    summary: '驗收 PageUI 規則：內容模式推導、欄寬推導、按鈕啟用判斷。'
  },
  {
    title: 'popupWin.js',
    path: '/demo/popup-win',
    summary: '驗收 popupWin 行為：popup/fullPopup/close/back/callback/windowOpen。'
  },
  {
    title: 'RPTUtil.js',
    path: '/demo/rpt-util',
    summary: '驗收 RPTUtil 行為：webName 推導、參數組裝、錯誤訊息、條碼 URL。'
  },
  {
    title: 'calendar.js',
    path: '/demo/calendar',
    summary: '驗收 calendar 行為：假日碼注入/重置與 isHoliday 判斷。'
  },
  {
    title: 'date.js',
    path: '/demo/date',
    summary: '驗收 date 行為：ROC/AD 轉換、加減日、日期差、日期格式化。'
  },
  {
    title: 'CSRUtil.js',
    path: '/demo/csr-util',
    summary: '驗收 CSRUtil 行為：$fmt、toInputROC、遮蔽規則。'
  },
  {
    title: 'utility.js',
    path: '/demo/utility',
    summary: '驗收 utility 行為：補碼、金額/日期格式化、全形空白清理。'
  },
  {
    title: 'validation.js',
    path: '/demo/validation',
    summary: '驗收 validation 行為：日期/Email/證件與日期區間檢核。'
  }
]
</script>

<template>
  <div class="q-pa-md demos-index-page">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">JSP_CM 業務邏輯展示總覽</div>
        <div class="text-body2 q-mt-sm">
          以下頁面以 `jsp_CM/` 原始檔案功能為驗收主軸，不展示框架特性。
          `header.jsp` 與 `msgDisplayer.jsp` 功能已整合至 BaseLayout 全域顯示。
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-list separator>
        <q-item
          v-for="item in demoItems"
          :key="item.path"
          clickable
          :to="item.path"
        >
          <q-item-section>
            <q-item-label class="text-subtitle2">{{ item.title }}</q-item-label>
            <q-item-label caption>{{ item.summary }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="open_in_new" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>
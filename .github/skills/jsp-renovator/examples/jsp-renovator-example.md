# JSP 翻新範例

> 虛構範例，涵蓋常見轉換情境，供 agent 參考。

---

## 原始 JSP

```jsp
<%@ page language="java" contentType="text/html; charset=BIG5"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="cathay" tagdir="/WEB-INF/tags/cathay"%>
<%@ taglib prefix="dz" tagdir="/WEB-INF/tags/csr/dz"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ include file="/html/CM/header.jsp"%>
<%@ include file="/html/CM/msgDisplayer.jsp"%>

<script src="<%=htmlBase%>/CM/js/prototype.js"></script>
<script src="<%=htmlBase%>/CM/js/ajax/CSRUtil.js"></script>
<script src="<%=htmlBase%>/CM/js/ui/PageUI.js"></script>
<script src="<%=htmlBase%>/CM/js/ui/validation.js"></script>

<script>
var showDetail = '${showDetail}';
var statusList = ${statusList};

Event.observe(window, 'load', function() {
  PageUI.createPage('DSX01100', '範例作業', '查詢頁', false);

  var valid = new Validation('form1', { useTitles: true, focusOnError: false });

  if ('${param.QUERY_ID}' != '') {
    $('QUERY_ID').value = '${param.QUERY_ID}';
    doQuery();
  }

  $('btn_query').observe('click', doQuery);
  $('btn_clear').observe('click', doClear);
});

function doQuery() {
  var valid = new Validation('form1', { useTitles: true });
  valid.reset();
  if (!valid.validate()) return;

  new Ajax.Request('<%=dispatcher%>/DSX0_1100/query', {
    parameters: {
      QUERY_ID: $F('QUERY_ID'),
      STATUS: $F('STATUS'),
    },
    onSuccess: function(xhr, resp) {
      if (CSRUtil.isSuccess(resp)) {
        tableData = resp.rtnList;
      }
    }
  });
}

function doClear() {
  $('form1').reset();
}
</script>

<body bgcolor="#F0FBC6">
<form id="form1" name="form1">
  <table width="100%" border="0" cellpadding="0" cellspacing="1" class="tbBox2">
    <tr>
      <td class="tbYellow" width="13%">查詢編號</td>
      <td class="tbYellow2" width="29%">
        <input id="QUERY_ID" name="QUERY_ID" type="text"
          class="required checkInputLength" maxlength="10"
          fieldName="查詢編號" />
      </td>
      <td class="tbYellow" width="13%">狀態</td>
      <td class="tbYellow2" width="29%">
        <select id="STATUS" name="STATUS" fieldName="狀態">
          <option value="">全部</option>
          <c:forEach var="map" items="${statusList}">
            <option value="${map.key}">${map.value}</option>
          </c:forEach>
        </select>
      </td>
      <td class="tbYellow2" align="center" width="16%">
        <dz:grantButtons>
          <input id="btn_query" type="button" value="查詢" />
          <input id="btn_clear" type="button" value="清除" />
        </dz:grantButtons>
      </td>
    </tr>
    <tr>
      <td class="tbYellow">金額</td>
      <td class="tbYellow2">
        <fmt:formatNumber value="${initAmount}" pattern="#,###.##" />
      </td>
      <td class="tbYellow">說明</td>
      <td class="tbYellow2" colspan="2">
        <cathay:LocaleDisplay value="${description}" />
      </td>
    </tr>
  </table>
</form>
</body>
```

---

## 翻新後 Vue SFC

```vue
<template>
  <div>
    <div :style="{ backgroundColor: '#F0FBC6' }">
      <form id="form1">
        <q-markup-table
          :style="{ width: '100%', borderSpacing: '1px' }"
          class="tbBox2"
          flat
          bordered
        >
          <tr>
            <td class="tbYellow" :style="{ width: '13%' }">查詢編號</td>
            <td class="tbYellow2" :style="{ width: '29%' }">
              <q-input
                v-model="queryId"
                dense
                outlined
                :error="!!errors.queryId"
                :error-message="errors.queryId"
              />
            </td>
            <td class="tbYellow" :style="{ width: '13%' }">狀態</td>
            <td class="tbYellow2" :style="{ width: '29%' }">
              <q-select
                v-model="status"
                dense
                outlined
                :options="statusList"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                :error="!!errors.status"
                :error-message="errors.status"
              />
            </td>
            <td class="tbYellow2" :style="{ textAlign: 'center', width: '16%' }">
              <!-- TODO: dz:grantButtons 無對應轉換文件，待人工實作 -->
              <dz-grant-buttons>
                <q-btn dense label="查詢" @click="doQuery" />
                <q-btn dense label="清除" @click="doClear" />
              </dz-grant-buttons>
            </td>
          </tr>
          <tr>
            <td class="tbYellow">金額</td>
            <td class="tbYellow2">
              <!-- TODO: fmt:formatNumber 無對應轉換文件，待人工實作 -->
              {{ formatNumber(initAmount, '#,###.##') }}
            </td>
            <td class="tbYellow">說明</td>
            <td class="tbYellow2" colspan="2">
              <!-- TODO: cathay:LocaleDisplay 無對應轉換文件，待人工實作 -->
              {{ localeDisplay(description) }}
            </td>
          </tr>
        </q-markup-table>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import { object, string } from 'yup'
import { useRoute } from 'vue-router'
import customAxios from '@/assets/libs/axios/instance.js'

const route = useRoute()

// ── 資料宣告 ──────────────────────────────────────────────────────────────────

// showDetail
const showDetail = ref(null)
// statusList
const statusList = ref([])
// initAmount
const initAmount = ref(null)
// description
const description = ref(null)
// tableData
const tableData = ref([])

// ── 表單驗證 ──────────────────────────────────────────────────────────────────

const schema = object({
  // QUERY_ID
  queryId: string().required().max(10),
})

// ⚠️ 必須設定 initialValues，否則進入頁面就顯示錯誤
// ⚠️ 必須設定 validateOnMount: false，防止頁面載入時觸發驗證
const { errors, validate, setValues, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { queryId: '', status: '' },
  validateOnMount: false,
})

// ⚠️ 驗證欄位必須使用 useField，並直接綁定至 v-model
// QUERY_ID
const { value: queryId } = useField('queryId')
// STATUS
const { value: status } = useField('status')

// ── Server-side 資料補全 ──────────────────────────────────────────────────────

const doPrompt = async () => {
  const resp = await customAxios.get('DSX0_1100/prompt')

  // FIXME: showDetail 資料來源待確認
  showDetail.value = resp.showDetail
  // FIXME: statusList 資料來源待確認
  statusList.value = resp.statusList
  // FIXME: initAmount 資料來源待確認
  initAmount.value = resp.initAmount
  // FIXME: description 資料來源待確認
  description.value = resp.description
}

// ── 業務邏輯 ──────────────────────────────────────────────────────────────────

const doQuery = async () => {
  const { valid } = await validate()
  if (!valid) return

  // FIXME: 原為 new Ajax.Request，已改為 customAxios
  await customAxios.post('DSX0_1100/query', {
    QUERY_ID: queryId,
    STATUS: status,
  }).then((resp) => {
    if (isSuccess(resp)) {
      tableData.value = resp.rtnList ?? null
    }
  })
}

const doClear = () => {
  // FIXME: 原為 form.reset()，已改為 resetForm
  resetForm()
}

onMounted(async () => {
  await doPrompt()

  // ${param.QUERY_ID} → route.query.QUERY_ID
  if (route.query.QUERY_ID) {
    setValues({ queryId: route.query.QUERY_ID })
    await doQuery()
  }

  createPage('DSX01100', '範例作業', '查詢頁', false)
})

// ── Fallback Composables ──────────────────────────────────────────────────────

// TODO: CSRUtil 無對應轉換文件，待人工實作
const useCSRUtil = () => {
  const isSuccess = (resp) => resp ?? null
  return { isSuccess }
}
const { isSuccess } = useCSRUtil()

// TODO: PageUI 無對應轉換文件，待人工實作
const usePageUI = () => {
  const createPage = (a, b, c, d) => a ?? null
  return { createPage }
}
const { createPage } = usePageUI()

// TODO: fmt:formatNumber 無對應轉換文件，待人工實作
const useFmtFormatNumber = () => {
  const formatNumber = (value, pattern) => value ?? null
  return { formatNumber }
}
const { formatNumber } = useFmtFormatNumber()

// TODO: cathay:LocaleDisplay 無對應轉換文件，待人工實作
const useCathayLocaleDisplay = () => {
  const localeDisplay = (value) => value ?? null
  return { localeDisplay }
}
const { localeDisplay } = useCathayLocaleDisplay()

// TODO: dz:grantButtons 無對應轉換文件，待人工實作
const DzGrantButtons = { template: '<slot />' }

// TODO: header.jsp 無對應轉換文件，待人工實作
// TODO: msgDisplayer.jsp 無對應轉換文件，待人工實作
</script>
```

---

## 轉換重點說明

| 情境 | 原始 JSP | 翻新後 | 備註 |
|---|---|---|---|
| SERVER 資料補全 | `${showDetail}`、`${statusList}` | `doPrompt` + `ref(null)` / `ref([])` | `FIXME` 標記資料來源 |
| URL param | `${param.QUERY_ID}` | `route.query.QUERY_ID` | 不走 doPrompt |
| 原生 AJAX | `new Ajax.Request` | `customAxios.post` | 結構最小翻譯，`FIXME` 標記 |
| JSTL core | `<c:forEach>` | `v-for` + `:options` | 直接翻譯，不走自訂資源 |
| 函式型自訂資源 | `CSRUtil.isSuccess()`、`PageUI.createPage()` | Fallback composable，傳入值 `?? null` | 放 script 最底部 |
| slot 型自訂資源 | `<dz:grantButtons>` | `DzGrantButtons = { template: '<slot />' }` | 子元素原地保留 |
| 輸出型自訂資源 | `<fmt:formatNumber>`、`<cathay:LocaleDisplay>` | Fallback composable，傳入值 `?? null` | template 保留傳入參數 |
| JSP include | `<%@ include file="header.jsp"%>` | `// TODO` 行內標記 | 不建立 composable |
| 驗證 class | `class="required checkInputLength"` | 移除 | 為舊版 validation.js 驗證用 class，已由 VeeValidate + Yup schema 取代 |
| JSP 專屬屬性 | `fieldName="查詢編號"` | 移除 | Vue 無對應用途 |
| 表單重置 | `form.reset()` | `resetForm()` | `FIXME` 標記，resetForm 同時清除值與錯誤狀態 |
| 版面結構 | `<table>`（無分頁/排序） | `<q-markup-table>` | `<tr>`、`<td>` 原地保留 |
| 廢棄屬性 | `bgcolor`、`align`、`width`、`cellpadding`、`cellspacing`、`border` | `:style` binding | 逐屬性轉換 |
| `<body>` 標籤 | `<body bgcolor="...">` | 移除，`bgcolor` 移至外層 `<div :style>` | SFC 無 body 標籤 |
| `name="form1"` | form 屬性 | 移除 | Vue 無需 form name |
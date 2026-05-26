# JSP Renovation Analysis Report: DSA30900

> 產出路徑：`.github/ir/analysis/DSA30900-analysis.md`
> **此報告為 Step 2～4 的唯一執行依據，產出後禁止在報告外自行新增翻新決策。**

---

## Report Meta

| 欄位 | 值 |
|---|---|
| FileName | `DSA30900` |
| Bean_Name | `DSA3_0900` |
| Module | `A3` |
| Source JSP | `/Users/cfh00911058/Desktop/AI in IT/default/jsp-to-vue/DSWeb/WebContent/html/DS/A3/DSA3_0900/DSA30900.jsp` |

---

## Scope Boundary Confirmation

- [x] 已僅以目標 JSP 內可見內容作為翻新依據
- [x] 未引用其他頁面規格
- [x] 未進行主動優化或行為簡化

---

## 表一：R2 翻新決策表

### R2-1：Quasar 元件替換

| 識別項目（原始元素/位置） | 具體產出 | 備註 |
|---|---|---|
| `<table id="tableA">` 查詢條件表格 | `<q-markup-table>` 保留原始 HTML 結構 | quasar-components.instructions.md |
| `<table id="grid" class="grid">` 查詢結果表格 | `<TableUI ref="tableRef" :pagination="{ rowsPerPage: 10 }" :columns="gridColumns" :split="['BUILD_MEASURE']" />` | tableUI.instructions.md；`allSortable:true` → 每欄 `sortable: true` |
| `<table id="tableC">` 承作分區查詢結果 | `<q-markup-table>` 保留原始 HTML 結構 | quasar-components.instructions.md |
| `<input name="functionSwitch" id="r_query" type="radio">` + `<input name="functionSwitch" id="r_areaCodeQuery" type="radio">` | `<q-field dense outlined>` 包裹兩個 `<q-radio v-model="functionSwitch" name="functionSwitch" val="r_query">` + `<q-radio v-model="functionSwitch" name="functionSwitch" val="r_areaCodeQuery">` | quasar-components.instructions.md；`const { value: functionSwitch } = useField('functionSwitch')` |
| `<input id="btn_areaCodeQuery" type="button">` | `<q-btn dense label="承作分區查詢" class="button ele_for_areaCode_query" @click="doAreaCodeQuery" />` | quasar-components.instructions.md |
| `<input id="btn_query" type="button">` | `<q-btn dense label="查詢" class="button ele_for_price_query" @click="doQuery" />` | quasar-components.instructions.md |
| `<input id="btn_landQuery" type="button">` | `<q-btn dense label="土建融查詢" class="button ele_for_price_query" @click="doLandQuery" />` | quasar-components.instructions.md |
| `<input id="btn_qroupQuery" type="button">` | `<q-btn dense label="整批分戶查詢" class="button ele_for_price_query" @click="doGroupQuery" />` | quasar-components.instructions.md |
| `<input id="btn_communityQuery" type="button">` | `<q-btn dense label="社區資料查詢" class="button ele_for_price_query" @click="doCommunityQuery" />` | quasar-components.instructions.md |
| `<input id="btn_clear" type="button">` | `<q-btn dense label="清除" class="button" @click="doClear" />` | quasar-components.instructions.md |
| `<input id="APPLY_ID" type="text" maxlength="11">` | `<q-input dense outlined v-model="applyId" maxlength="11" class="textBox2 checkInputLength ele_for_price_query" :error="!!errors.applyId" :error-message="errors.applyId" />` | quasar-components.instructions.md；`const { value: applyId } = useField('applyId')` |
| `<input id="TRADE_DATE_BEG" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="tradeDateBeg" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="tradeDateBeg"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: tradeDateBeg } = useField('tradeDateBeg')` |
| `<input id="TRADE_DATE_END" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="tradeDateEnd" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="tradeDateEnd"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: tradeDateEnd } = useField('tradeDateEnd')` |
| `<input id="APPR_DATE_BEG" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="apprDateBeg" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="apprDateBeg"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: apprDateBeg } = useField('apprDateBeg')` |
| `<input id="APPR_DATE_END" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="apprDateEnd" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="apprDateEnd"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: apprDateEnd } = useField('apprDateEnd')` |
| `<select id="USE_AREA1">` + `<c:forEach>` options | `<q-select dense outlined emit-value map-options v-model="useArea1" :options="useArea1List" class="ele_for_price_query" :error="!!errors.useArea1" :error-message="errors.useArea1" />` | quasar-components.instructions.md；`const { value: useArea1 } = useField('useArea1')`；`const useArea1List = ref([])` 由 doPrompt 補償 |
| `<select id="RST_KIND">` + `<c:forEach>` options | `<q-select dense outlined emit-value map-options v-model="rstKind" :options="rstKindList" class="ele_for_price_query" :error="!!errors.rstKind" :error-message="errors.rstKind" />` | quasar-components.instructions.md；`const { value: rstKind } = useField('rstKind')`；`const rstKindList = ref([])` 由 doPrompt 補償 |
| `<select id="CITY">` + `<c:forEach>` options | `<q-select dense outlined emit-value map-options v-model="city" :options="cityOptions" :error="!!errors.city" :error-message="errors.city" @update:model-value="doGetTownList" />` | quasar-components.instructions.md；`const { value: city } = useField('city')`；`const cityList = ref([])` 由 doPrompt 補償；`cityOptions` = computed 由 `cityList` 轉換 |
| `<select id="TOWN">` 動態注入 options | `<q-select dense outlined emit-value map-options v-model="town" :options="townOptions" :error="!!errors.town" :error-message="errors.town" />` | quasar-components.instructions.md；`const { value: town } = useField('town')`；`const townOptions = ref([{ label: '鄉鎮區', value: '' }])` 動態更新 |
| `<input id="ADDR_NO" type="text">` | `<q-input dense outlined v-model="addrNo" class="textBox2" :placeholder="addrNoPlaceholder" :error="!!errors.addrNo" :error-message="errors.addrNo" />` | quasar-components.instructions.md；`const { value: addrNo } = useField('addrNo')`；`addrNoPlaceholder` 由 `viewType` 控制 |
| `<input id="LONGITUDE" type="text">` | `<q-input dense outlined v-model="longitude" class="textBox2 ele_for_areaCode_query" placeholder="精確至小數第6位(例:121.553012)" :error="!!errors.longitude" :error-message="errors.longitude" />` | quasar-components.instructions.md；`const { value: longitude } = useField('longitude')` |
| `<input id="LATITUDE" type="text">` | `<q-input dense outlined v-model="latitude" class="textBox2 ele_for_areaCode_query" placeholder="精確至小數第6位(例:25.033021)" :error="!!errors.latitude" :error-message="errors.latitude" />` | quasar-components.instructions.md；`const { value: latitude } = useField('latitude')` |
| `<select id="EQU_SIGN">` + `<c:forEach>` options | `<q-select dense outlined emit-value map-options v-model="equSign" :options="equSignList" class="ele_for_price_query" />` | quasar-components.instructions.md；`const { value: equSign } = useField('equSign')`；`const equSignList = ref([])` 由 doPrompt 補償 |
| `<input id="FLOOR" type="text">` | `<q-input dense outlined v-model="floor" class="textBox2 validate-digits ele_for_price_query" :error="!!errors.floor" :error-message="errors.floor" />` | quasar-components.instructions.md；`const { value: floor } = useField('floor')` |
| `<select id="USE_FOR">` + `<c:forEach>` options | `<q-select dense outlined emit-value map-options v-model="useFor" :options="useForList" class="ele_for_price_query" :error="!!errors.useFor" :error-message="errors.useFor" />` | quasar-components.instructions.md；`const { value: useFor } = useField('useFor')`；`const useForList = ref([])` 由 doPrompt 補償 |
| `<input id="BUILD_AGE1" type="text">` | `<q-input dense outlined v-model="buildAge1" class="textBox2 validate-digits ele_for_price_query" :error="!!errors.buildAge1" :error-message="errors.buildAge1" />` | quasar-components.instructions.md；`const { value: buildAge1 } = useField('buildAge1')` |
| `<input id="BUILD_AGE2" type="text">` | `<q-input dense outlined v-model="buildAge2" class="textBox2 validate-digits validateBetween ele_for_price_query" :error="!!errors.buildAge2" :error-message="errors.buildAge2" />` | quasar-components.instructions.md；`const { value: buildAge2 } = useField('buildAge2')` |
| `<input id="CASE_NAME" type="text">` | `<q-input dense outlined v-model="caseName" class="textBox2 ele_for_price_query" :error="!!errors.caseName" :error-message="errors.caseName" />` | quasar-components.instructions.md；`const { value: caseName } = useField('caseName')` |
| `<input id="LAND_MEASURE1" type="text">` | `<q-input dense outlined v-model="landMeasure1" class="textBox2 validate-digits ele_for_price_query" :error="!!errors.landMeasure1" :error-message="errors.landMeasure1" />` | quasar-components.instructions.md；`const { value: landMeasure1 } = useField('landMeasure1')` |
| `<input id="LAND_MEASURE2" type="text">` | `<q-input dense outlined v-model="landMeasure2" class="textBox2 validate-digits validateBetween ele_for_price_query" :error="!!errors.landMeasure2" :error-message="errors.landMeasure2" />` | quasar-components.instructions.md；`const { value: landMeasure2 } = useField('landMeasure2')` |
| `<input id="BUILD_MEASURE1" type="text">` | `<q-input dense outlined v-model="buildMeasure1" class="textBox2 validate-digits ele_for_price_query" :error="!!errors.buildMeasure1" :error-message="errors.buildMeasure1" />` | quasar-components.instructions.md；`const { value: buildMeasure1 } = useField('buildMeasure1')` |
| `<input id="BUILD_MEASURE2" type="text">` | `<q-input dense outlined v-model="buildMeasure2" class="textBox2 validate-digits validateBetween ele_for_price_query" :error="!!errors.buildMeasure2" :error-message="errors.buildMeasure2" />` | quasar-components.instructions.md；`const { value: buildMeasure2 } = useField('buildMeasure2')` |
| `<input id="FINISH_DATE_BEG" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="finishDateBeg" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="finishDateBeg"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: finishDateBeg } = useField('finishDateBeg')` |
| `<input id="FINISH_DATE_END" type="text" datatype="ROCDate" maxlength="7"> + <img calendar.gif>` | `<q-input dense outlined v-model="finishDateEnd" maxlength="7" ...><template #append><q-icon name="event"><q-popup-proxy><ROCDatePicker v-model="finishDateEnd"/></q-popup-proxy></q-icon></template></q-input>` | calendar.instructions.md；`const { value: finishDateEnd } = useField('finishDateEnd')` |
| grid 欄位 `APPLY_ID` render：`new Element('a', {href:'#'}).update(value).observe('click', ...)` | `<template #body-cell-APPLY_ID="props"><q-td :props="props"><a v-if="props.row.APPLY_ID" href="#" @click.prevent="doWindowOpen(props.row.QUERY_TYPE, props.row.APPLY_ID)">{{ props.row.APPLY_ID }}</a></q-td></template>` | FIXME：Prototype.js Element 改為 Vue slot；v-html 禁用 |
| grid 欄位 `ADDRESS` render：條件加彩色 `<FONT>` 前綴 | `<template #body-cell-ADDRESS="props"><q-td :props="props" :style="{ fontFamily: 'EUDC' }"><span v-if="props.row.CONTRACT_AREA == '1' \|\| parseInt(props.row.RESTRICT_AREA) > 1" style... >$$ </span><span v-if="parseInt(props.row.CNT) > 1" ...>@@ </span><span v-if="props.row.IS_ADD == '1'" ...>** </span>{{ props.row.ADDRESS }}</q-td></template>` | FIXME：v-html 禁用，改為條件式 span；inline style 例外：僅限單一屬性 fontFamily，無法透過 class 達成（EUDC 字型） |

---

### R2-2：表單驗證

> JSP 引用 `validation.js`，使用三個 Validation 實例 (valid1, valid2, valid3) 對同一 form 作不同驗證邏輯。
> FIXME：VeeValidate 為單一 schema，三個實例的分段驗證邏輯需人工確認是否等價。

| 識別項目（欄位 id） | CSS class | Yup 規則 | 錯誤訊息 | 備註 |
|---|---|---|---|---|
| `APPLY_ID` | `checkInputLength` | `string().max(11)` | 輸入值超出長度限制 | valid1 |
| `TRADE_DATE_BEG` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `TRADE_DATE_END` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `APPR_DATE_BEG` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `APPR_DATE_END` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `FLOOR` | `validate-digits` | `number().positive().integer()` | 請輸入有效正整數 | valid1 |
| `BUILD_AGE1` | `validate-digits` | `number().positive().integer()` | 請輸入有效正整數 | valid1 |
| `BUILD_AGE2` | `validate-digits validateBetween` | `number().positive().integer().test('validateBetween', '迄值不得小於起值', function(val){ return validateBetween(this.parent.buildAge1, val) })` | 請輸入有效正整數 / 迄值不得小於起值 | valid1 |
| `LAND_MEASURE1` | `validate-digits` | `number().positive().integer()` | 請輸入有效正整數 | valid1 |
| `LAND_MEASURE2` | `validate-digits validateBetween` | `number().positive().integer().test('validateBetween', '迄值不得小於起值', function(val){ return validateBetween(this.parent.landMeasure1, val) })` | 請輸入有效正整數 / 迄值不得小於起值 | valid1 |
| `BUILD_MEASURE1` | `validate-digits` | `number().positive().integer()` | 請輸入有效正整數 | valid1 |
| `BUILD_MEASURE2` | `validate-digits validateBetween` | `number().positive().integer().test('validateBetween', '迄值不得小於起值', function(val){ return validateBetween(this.parent.buildMeasure1, val) })` | 請輸入有效正整數 / 迄值不得小於起值 | valid1 |
| `FINISH_DATE_BEG` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `FINISH_DATE_END` | `validate-ROCDate` | `string().validateROCDate()` | 請輸入正確的民國日期格式 | valid1 |
| `CITY` (valid1) | `validateAddr_No`（自訂） | `string().test('validateAddr_No', '地址路名門牌與縣市別需擇一輸入', function(val){ return validateAddrNo(this.parent.applyId, val, this.parent.addrNo) })` | 地址路名門牌與縣市別需擇一輸入 | FIXME：valid1 對應 query/landQuery/groupQuery |
| `ADDR_NO` (valid1) | `validateAddr_No`（自訂） | `string().test('validateAddr_No', '地址路名門牌與縣市別需擇一輸入', function(val){ return validateAddrNo(this.parent.applyId, this.parent.city, val) })` | 地址路名門牌與縣市別需擇一輸入 | FIXME：valid1 |
| `CITY` (valid2) | `validateCase_Name`（自訂） | `string().test('validateCase_Name', '案名與縣市別需擇一輸入', function(val){ return validateCaseName(val, this.parent.caseName) })` | 案名與縣市別需擇一輸入 | FIXME：valid2 對應 communityQuery |
| `CASE_NAME` (valid2) | `validateCase_Name`（自訂） | `string().test('validateCase_Name', '案名與縣市別需擇一輸入', function(val){ return validateCaseName(this.parent.city, val) })` | 案名與縣市別需擇一輸入 | FIXME：valid2 |
| `ADDR_NO` (valid3) | `validateAddrAndLon`（自訂） | `string().test('validateAddrAndLon', '【地址路名門牌】與【經度、緯度】需擇一輸入', function(val){ return validateAddrAndLon(val, this.parent.longitude, this.parent.latitude) })` | 【地址路名門牌】與【經度、緯度】需擇一輸入 | FIXME：valid3 對應 areaCodeQuery |
| `ADDR_NO` (valid3) | `validateFullAddrNo`（自訂） | `string().test('validateFullAddrNo', '使用地址查詢，請輸入完整門牌', function(val){ return validateFullAddrNo(val) })` | 使用地址查詢，請輸入完整門牌 | FIXME：valid3 |
| `CITY` (valid3) | `required` | `string().required()` | 不可空白 | FIXME：valid3 required，僅承作分區查詢時驗證 |
| `TOWN` (valid3) | `required` | `string().required()` | 不可空白 | FIXME：valid3 required，僅承作分區查詢時驗證 |

**useForm 初始化**：
```js
const { errors, validate, resetForm } = useForm({
  initialValues: {
    functionSwitch: 'r_query',
    applyId: '',
    tradeDateBeg: '', tradeDateEnd: '',
    apprDateBeg: '', apprDateEnd: '',
    useArea1: '0', rstKind: '0',
    city: '', town: '',
    addrNo: '', longitude: '', latitude: '',
    equSign: '=',
    floor: '',
    useFor: '0',
    buildAge1: '', buildAge2: '',
    caseName: '',
    landMeasure1: '', landMeasure2: '',
    buildMeasure1: '', buildMeasure2: '',
    finishDateBeg: '', finishDateEnd: '',
  },
  validationSchema: schema,
  validateOnMount: false,
})
```

---

### R2-3：Server-side 資料補償

| 識別項目（原始語法） | 補償 key | 資料用途 | 備註 |
|---|---|---|---|
| `${showApplyId}` | `showApplyId` | 控制 A1_TR_1 列顯示/隱藏、gridColumns 欄位組合、按鈕 rowSpan | doPrompt → `showApplyId` ref；`const showApplyId = ref(true)` |
| `${fromPublicBean}` | `fromPublicBean` | 控制 AJAX actionName 與 beanName（若為 `'DSA3_2400'` 則改用 fromPublicBean） | doPrompt → `fromPublicBean` ref；`const fromPublicBean = ref('')` |
| `${USE_AREA1_LIST}` | `USE_AREA1_LIST` | 使用分區 select options | doPrompt → `useArea1List` ref；格式 `[{ key, value }]` → 轉為 `[{ label, value }]` |
| `${RST_KIND_LIST}` | `RST_KIND_LIST` | 列管區 select options | doPrompt → `rstKindList` ref；同上格式轉換 |
| `${CITY_LIST}` | `CITY_LIST` | 縣市別 select options | doPrompt → `cityList` ref；格式 `[{ CITY_NAME }]` → `[{ label: CITY_NAME, value: CITY_NAME }]` |
| `${EQU_SIGN_LIST}` | `EQU_SIGN_LIST` | 等號符號 select options | doPrompt → `equSignList` ref；格式 `[{ key, value }]` → `[{ label, value }]` |
| `${USE_FOR_LIST}` | `USE_FOR_LIST` | 類別 select options | doPrompt → `useForList` ref；格式 `[{ key, value }]` → `[{ label, value }]` |

**doPrompt 結構**：
```js
const doPrompt = async () => {
  const resp = await customAxios.get('DSA3_0900/prompt')
  // FIXME: 資料來源待確認
  showApplyId.value = resp.showApplyId
  fromPublicBean.value = resp.fromPublicBean
  useArea1List.value = resp.USE_AREA1_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
  rstKindList.value = resp.RST_KIND_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
  cityList.value = resp.CITY_LIST?.map(m => ({ label: m.CITY_NAME, value: m.CITY_NAME })) ?? []
  equSignList.value = resp.EQU_SIGN_LIST?.map(m => ({ label: m.value, value: m.key })) ?? []
  useForList.value = resp.USE_FOR_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
}
```

---

### R2-4：自訂資源

| 識別項目 | 原始方法 | 有對應文件？ | 翻新方式 | 具體產出 |
|---|---|---|---|---|
| `CSRUtil.js` | `CSRUtil.$fmt(value, AMT_Formate)` | ✅ csrUtil.instructions.md | 依文件翻新 | `numberAddComma(value)` from `@/assets/utils/format.js` |
| `CSRUtil.js` | `CSRUtil.isSuccess(resp)` | ✅ csrUtil.instructions.md | 依文件翻新 | `resp?.ErrMsg?.returnCode === 0`（嵌入 ajaxPost 改寫中） |
| `date.js` | `Date.toROC(value)` | ✅ date.instructions.md | 依文件翻新 | `useCommon().tranCEorROCDate(value, 'rocDate')` |
| `date.js` | `toY2K(value)` | ✅ date.instructions.md | 依文件翻新 | `useCommon().tranCEorROCDate(value, 'ceDate')` |
| `calendar.js` | `getCalendarFor(elem)` | ✅ calendar.instructions.md | 依文件翻新 | `<q-popup-proxy>` + `<ROCDatePicker>` 內建取代 |
| `PageUI.js` | `PageUI.createPage(pageNO, title, subTitle, noPageFrame)` | ✅ pageUI.instructions.md | 依文件翻新 | `pageUI.createPage('DSA30900', '鑑價作業', '擔保品行情查詢', false)` |
| `PageUI.js` | `PageUI.loadin(loadinConfigs, fixedNum)` | ✅ pageUI.instructions.md | 依文件翻新 | `pageUI.loadin(['form1', 'grid', 'tableC'], 1)` |
| `TableUI.js` | `new TableUI({table, pageSize, allSortable, split, column})` | ✅ tableUI.instructions.md | 依文件翻新 | `<TableUI ref="tableRef" :pagination="{ rowsPerPage: 10 }" :columns="gridColumns" />` + `tableRef.value.load(records)` |
| `popupWin.js` | `popupWin.windowOpen(url, opts)` | ✅ popupWin.instructions.md | 依文件翻新 | `popupWin.windowOpen(url, opts)` + `<PopupWinDialog .../>` |
| `utility.js` | `fix` | ❌ 無文件 | utility.js 的 `fix` 僅用於 Prototype.js `Event.observe(window, 'resize/scroll', fix)`，屬 R1 移除項目，無需 Fallback | — |
| `<%@ include file="/html/CM/msgDisplayer.jsp"%>` | `displayMessage()` | ❌ 無文件 | Fallback | `useMsgDisplayer().displayMessage()` → `() => void` |

---

## 表二：Fallback 清單

| composable 名稱 | 原始方法 | 簽名 | Fallback 模式 |
|---|---|---|---|
| `useMsgDisplayer` | `displayMessage` | `displayMessage()` | 無傳入值：`() => void` |

---

## Risk / Unknowns

- [ ] 有，說明如下：
  - `// FIXME:` 項目：
    - JSP 使用三個 Validation 實例 (valid1, valid2, valid3)，各自驗證不同欄位子集；VeeValidate 單一 schema 無法直接分段驗證，需人工確認各 query 方法對應的驗證邏輯是否等價
    - `ADDRESS` 欄位 grid render 使用 `<FONT color>` HTML 字串，改用條件式 span；fontFamily EUDC 以 `:style` 取代
    - `column.attrs.rowSpan` 與 `column.split` TableUI 屬性無對應 tableUI.instructions.md 明確規範，以 FIXME 標記
    - `${showApplyId ne true}` 控制 gridColumn 動態修改（移除 APPLY_ID、TRADE_DATE、BUILD_AGE 欄位並修改 BUILD_AGE 的 rowSpan）→ 以 `computed` `gridColumns` 實作
    - `${fromPublicBean}` 控制 beanName 與 actionName → 以 `fromPublicBean` ref 實作動態切換

---

## Step Gating

- [x] 表一所有列的「具體產出」已寫到實作層級，Step 4 可直接套用
- [x] 表二所有列已確認 composable 名稱與方法簽名
- [x] doPrompt 所有補償 key 已列出（showApplyId, fromPublicBean, USE_AREA1_LIST, RST_KIND_LIST, CITY_LIST, EQU_SIGN_LIST, USE_FOR_LIST）
- [x] useForm initialValues 所有 key 已列出（25 個欄位）
- [x] Step 2 僅依表二建立 Fallback composables
- [x] Step 3 僅執行 R1 直接翻新
- [x] Step 4 僅執行表一列出項目，不得自行新增

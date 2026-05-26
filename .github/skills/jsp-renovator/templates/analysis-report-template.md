# JSP Renovation Analysis Report: {FileName}

> 產出路徑：`.github/ir/analysis/{FileName}-analysis.md`
> **此報告為 Step 2～4 的唯一執行依據，產出後禁止在報告外自行新增翻新決策。**

---

## Report Meta

| 欄位 | 值 |
|---|---|
| FileName | `{FileName}` |
| Bean_Name | `{Bean_Name}` |
| Module | `{Module}` |
| Source JSP | `{jsp_path}` |

---

## Scope Boundary Confirmation

- [ ] 已僅以目標 JSP 內可見內容作為翻新依據
- [ ] 未引用其他頁面規格
- [ ] 未進行主動優化或行為簡化

---

## 表一：R2 翻新決策表

> **REQUIRED**：「具體產出」欄位必須寫明到實作層級（元件名稱、ref 名稱、schema key、composable 呼叫等），不得只寫規範文件名稱。
> Step 4 依此表逐項執行，未列出項目禁止自行新增。

### R2-1：Quasar 元件替換

| 識別項目（原始元素/位置） | 具體產出 | 備註 |
|---|---|---|
| 範例：`<table id="grid">` | `<q-table flat bordered dense row-key="APPLY_ID" selection="multiple" v-model:selected="selected">` + `useTableSelection(rows, 'APPLY_ID')` | TableUI.instructions.md |
| 範例：`<input type="text" id="applyDate">` | `<q-input dense outlined v-model="applyDate" clearable>` | quasar-components.instructions.md |
| 範例：`<input type="text"> + <img calendar.gif>` | `<q-input>` + `<q-popup-proxy>` + `<q-date mask="YYYYMMDD">` | calendar.instructions.md |
| 範例：`<select id="statusCode">` | `<q-select dense outlined emit-value map-options v-model="statusCode" :options="statusOptions">` | quasar-components.instructions.md |

### R2-2：表單驗證

> 無引用 `validation.js` 則填「無」。

| 識別項目（欄位 id/name） | CSS class | Yup 規則 | 錯誤訊息 | 備註 |
|---|---|---|---|---|
| 範例：`applyId` | `required` | `string().required()` | `申請編號為必填` | |
| 範例：`amount` | `validate-number` | `string().test('validate-number', '金額格式錯誤', ...)` | `金額格式錯誤` | |
| 範例：`startDate` | `validate-ROCDate` | `string().test('validate-ROCDate', '日期格式錯誤', ...)` | `日期格式錯誤` | disabled → FIXME |

**useForm 初始化**：
```js
// 填寫所有欄位的 initialValues key
const { handleSubmit, resetForm } = useForm({
  initialValues: { applyId: '', amount: '', startDate: '' },
  validationSchema: schema,
  validateOnMount: false
})
```

### R2-3：Server-side 資料補償

> 無 EL 表達式則填「無」。

| 識別項目（原始語法） | 補償 key | 資料用途 | 備註 |
|---|---|---|---|
| 範例：`${showApplyId}` | `showApplyId` | 控制申請編號欄位顯示/隱藏 | doPrompt → `formData.showApplyId` |
| 範例：`${sessionScope.userId}` | `userId` | 預填申請人 | doPrompt → `formData.userId` |

**doPrompt 結構**：
```js
// 列出所有補償 key
const doPrompt = async () => {
  const resp = await customAxios.get('{Bean_Name}/prompt')
  // FIXME: 資料來源待確認
  formData.showApplyId = resp.data.showApplyId
  formData.userId = resp.data.userId
}
```

### R2-4：自訂資源

| 識別項目 | 原始方法 | 有對應文件？ | 翻新方式 | 具體產出 |
|---|---|---|---|---|
| 範例：`date.js` | `toROC(date)` | ✅ date.instructions.md | 依文件翻新 | `tranCEorROCDate(date, 'rocDate')` from `common.js` |
| 範例：`calendar.js` | `getCalendarFor(elem)` | ✅ calendar.instructions.md | 依文件翻新 | `<q-popup-proxy>` + `<q-date>` |
| 範例：`PageUI.js` | `createPage(arg)` | ❌ 無文件 | Fallback | `usePageUI().createPage(arg)` |
| 範例：`dz:grantButtons` | — | ❌ 無文件 | Fallback（slot 型） | `<useGrantButtons><slot /></useGrantButtons>` |
| 範例：`cathay:formatNumber` | `format(val)` | ❌ 無文件 | Fallback | `useFormatNumber().format(val)` |

---

## 表二：Fallback 清單

> Step 2 依此表逐一建立 composable，方法名稱必須與「原始方法」一致，禁止實作內部邏輯。

| composable 名稱 | 原始方法 | 簽名 | Fallback 模式 |
|---|---|---|---|
| 範例：`usePageUI` | `createPage` | `createPage(arg)` | 函式型：`(arg) => arg ?? null` |
| 範例：`useGrantButtons` | — | — | slot 型：`template: '<slot />'` |
| 範例：`useFormatNumber` | `format` | `format(val)` | 函式型：`(val) => val ?? null` |

---

## Risk / Unknowns

> 列出翻新過程中不確定的項目，後續以 FIXME/TODO 標記。

- [ ] 無
- [ ] 有，說明如下：
  - `// TODO:` 項目：
  - `// FIXME:` 項目：

---

## Step Gating

> 執行前確認，確保後續步驟有足夠資訊，不需回頭解讀 JSP。

- [ ] 表一所有列的「具體產出」已寫到實作層級，Step 4 可直接套用
- [ ] 表二所有列已確認 composable 名稱與方法簽名
- [ ] doPrompt 所有補償 key 已列出
- [ ] useForm initialValues 所有 key 已列出
- [ ] Step 2 僅依表二建立 Fallback composables
- [ ] Step 3 僅執行 R1 直接翻新
- [ ] Step 4 僅執行表一列出項目，不得自行新增
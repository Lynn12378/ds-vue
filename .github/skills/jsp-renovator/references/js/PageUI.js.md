# PageUI.js 自訂依賴翻新指引

## Core Principles

- `<script src=".../PageUI.js">` 記錄路徑後直接移除
- `PageUI.createPage()` 已翻新為 `CustomPage`（`@/components/layout/CustomPage.vue`）
- `PageUI.createContent()` 欄位改用 Quasar Form 元件直接排版，參照 [Quasar 元件規範](../../instructions/quasar-components.md)
- `JsUtils.*` 為 `PageUI.js` 內部封裝工具集，頁面直接呼叫時依下方對照表處理

---

## 翻新對照表

### PageUI.*

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `PageUI.createPage(pageNO, title, subTitle)` | 見 [createPage 翻新](./PageUI/createPage.md) | — |
| `PageUI.createPage(..., true)` | `<CustomPage :no-frame="true">` | `noPageFrame = true` |
| `PageUI.setSubTitle(text)` | `customPageRef.value.setSubTitle(text)` | 透過 ref 呼叫 |
| `PageUI.createContent(config, values, showType)` | 見 [createContent 翻新](./PageUI/createContent.md) | — |
| `PageUI.setContentsDisplay(content, 0)` | `:mode="'input'"` | `CustomPage` prop |
| `PageUI.setContentsDisplay(content, 1)` | `:mode="'display'"` | `CustomPage` prop（預設） |
| `PageUI.getContentValues(content)` | 直接讀取 `reactive` / `ref` 物件 | — |
| `PageUI.setContentValues(content, values)` | `Object.assign(form, values)` | — |
| `PageUI.rollbackContentValues(content)` | `Object.assign(form, savedForm)` | 頁面自行儲存舊值後還原 |
| `PageUI.commitContentValues(content)` | — | — |
| `PageUI.createButtonArea(content, config)` | `<q-btn>` 自行排版 | — |
| `PageUI.setButtonsEnable(div, enableArray)` | `:disable="..."` binding | — |
| `PageUI.loadin(configs, fixedNum)` | — | — |
| `PageUI.fixedContent(fixedNum)` | — | — |
| `PageUI.resize()` | — | — |
| `PageUI.createPageWithAllBodySubElement(...)` | — | — |
| `window.init()` | `onMounted(() => { ... })` | — |

---

### JsUtils.*

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `JsUtils.getDOM(id)` | `document.getElementById(id)` | — |
| `JsUtils.createDOMElement(tag, attrs, ...)` | — | — |
| `JsUtils.removeAllChildren(node)` | — | — |
| `JsUtils.cloneObject(obj)` | `JSON.parse(JSON.stringify(obj))` | — |
| `JsUtils.setClass(node, className)` | `:class="{ [className]: condition }"` | — |
| `JsUtils.getClass(node)` | `el.classList` | — |
| `JsUtils.compareClass(node, className)` | `el.classList.contains(className)` | — |
| `JsUtils.setEventObserve(elem, event, fn)` | `@event="fn"` | — |
| `JsUtils.stopEventObserving(elem, event, fn)` | — | — |
| `JsUtils.getOffsetTop(elem)` | `el.getBoundingClientRect().top` | — |
| `JsUtils.getParentByTagName(node, tag)` | `el.closest(tag)` | — |
| `JsUtils.isArray(v)` | `Array.isArray(v)` | — |
| `JsUtils.isNotEmptyArray(v)` | `Array.isArray(v) && v.length > 0` | — |
| `JsUtils.isObject(v)` | `typeof v === 'object' && v !== null` | — |
| `JsUtils.isString(v)` | `typeof v === 'string'` | — |
| `JsUtils.isNumeric(v)` | `!isNaN(v)` | — |
| `JsUtils.isFunction(v)` | `typeof v === 'function'` | — |
| `JsUtils.isDOMObject(v)` | `v instanceof HTMLElement` | — |
| `JsUtils.trim(v)` | `v.trim()` | — |
| `JsUtils.lTrim(v)` | `v.trimStart()` | — |
| `JsUtils.rTrim(v)` | `v.trimEnd()` | — |
| `JsUtils.stringToArray(str, splitChar)` | `str.split(splitChar).map(s => s.trim())` | — |
| `JsUtils.arrayToString(arr)` | `arr.join(', ')` | — |
| `JsUtils.addOptions(select, opts, key, valueKey)` | `<q-select :options emit-value map-options>` | 見 [Quasar 元件規範](../../instructions/quasar-components.md) |
| `JsUtils.setOption(select, value)` | `q-select v-model` 直接賦值 | — |
| `JsUtils.removeOptions(select)` | `options.value = []` | — |
| `JsUtils.getSelectName(select)` | — | `q-select option-label` 自動處理 |
| `JsUtils.addChecks(type, node, items, ...)` | `<q-checkbox>` / `<q-radio>` + `v-for` | 見 [Quasar 元件規範](../../instructions/quasar-components.md) |
| `JsUtils.setCheck(type, name, node, value)` | `v-model` 直接賦值 | — |
| `JsUtils.getChecks(type, name, node)` | `v-model` 直接讀取 | — |
| `JsUtils.clearChecked(type, name, node)` | `checked.value = []` | — |
| `JsUtils.setDateInput(node, value)` | `CustomDate v-model` | 見 [calendar.js 翻新指引](./calendar.js.md) |
| `JsUtils.getDateInput(node)` | `CustomDate v-model` 直接讀取 | 見 [calendar.js 翻新指引](./calendar.js.md) |
| `JsUtils.getSimpleDateFormat(pattern, isROC)` | `new SimpleDateFormat(pattern, locale)` | `import { SimpleDateFormat } from '@/assets/utils/date.js'`；`isROC: true` → `SimpleDateFormat.TW`，`isROC: false` → `SimpleDateFormat.US` |
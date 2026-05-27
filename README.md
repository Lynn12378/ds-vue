# ds-vue

JSP_CM 翻新 v2 示範專案（Vue 3 + Vite + Quasar + Pinia）。

## 開發指令

- `npm install`
- `npm run dev`
- `npm run build`

## 主要展示路由

- `/`：首頁（CustomTable 功能基礎展示）
- `/demo`：依舊資源分類的業務邏輯展示索引（僅開發環境可用）

## 人工驗收清單

- `docs/v2/business-logic-checklist.md`

## 專案目錄結構

```text
.
├── docs/
│   ├── *.js-analysis.md
│   └── v2/
│       ├── business-logic-checklist.md
│       ├── refactor-task-list.md
│       ├── resource-mapping-matrix.md
│       └── ...
├── jsp_CM/
│   ├── CSRUtil.js
│   ├── PageUI.js
│   ├── RPTUtil.js
│   ├── TableUI.js
│   ├── calendar.js
│   ├── date.js
│   ├── header.jsp
│   ├── msgDisplayer.jsp
│   ├── popupWin.js
│   ├── utility.js
│   └── validation.js
├── public/
│   └── popup-demo-target.html
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── assets/
│   │   ├── libs/
│   │   │   ├── customAxios/
│   │   │   └── QuasarPlugin.js
│   │   ├── sass/
│   │   └── utils/
│   │       ├── common.js
│   │       ├── format.js
│   │       ├── validator.js
│   │       └── legacy/
│   ├── components/
│   │   ├── BaseLayout.vue
│   │   └── common/
│   ├── composables/
│   ├── directives/
│   ├── router/
│   │   ├── index.js
│   │   └── router.js
│   ├── service/
│   ├── stores/
│   └── views/
│       ├── HomePage.vue
│       ├── PopupWinDemoPage.vue
│       ├── V2Round2Page.vue
│       └── demos/
│           ├── DemosIndexPage.vue
│           ├── TableUIDemoPage.vue
│           ├── PageUIDemoPage.vue
│           ├── PopupWinGuidePage.vue
│           ├── RPTUtilDemoPage.vue
│           ├── CalendarDemoPage.vue
│           ├── DateDemoPage.vue
│           ├── CSRUtilDemoPage.vue
│           ├── UtilityDemoPage.vue
│           └── ValidationDemoPage.vue
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

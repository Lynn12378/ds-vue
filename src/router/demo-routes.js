import BaseLayout from '@/components/BaseLayout.vue'

// 此為開發環境專用的 Demo 路由，供業務邏輯展示使用，正式環境會自動排除
export const demoRoutes = import.meta.env.DEV
    ? [
        {
            path: '/demo',
            component: BaseLayout,
            children: [
                {
                    path: '',
                    name: 'demo-index',
                    meta: {
                        title: 'Demo Index',
                    },
                    component: () => import('@/views/HomePage.vue')
                },
                {
                    path: 'table-ui',
                    name: 'demo-table-ui',
                    meta: {
                        title: 'TableUI.js Demo',
                    },
                    component: () => import('@/views/demos/TableUIDemoPage.vue')
                },
                {
                    path: 'page-ui',
                    name: 'demo-page-ui',
                    meta: {
                        title: 'PageUI.js Demo',
                    },
                    component: () => import('@/views/demos/PageUIDemoPage.vue')
                },
                {
                    path: 'popup-win',
                    name: 'demo-popup-win',
                    meta: {
                        title: 'popupWin.js Demo',
                    },
                    component: () => import('@/views/demos/PopupWinGuidePage.vue')
                },
                {
                    path: 'rpt-util',
                    name: 'demo-rpt-util',
                    meta: {
                        title: 'RPTUtil.js Demo',
                    },
                    component: () => import('@/views/demos/RPTUtilDemoPage.vue')
                },
                {
                    path: 'calendar',
                    name: 'demo-calendar',
                    meta: {
                        title: 'calendar.js Demo',
                    },
                    component: () => import('@/views/demos/CalendarDemoPage.vue')
                },
                {
                    path: 'date',
                    name: 'demo-date',
                    meta: {
                        title: 'date.js Demo',
                    },
                    component: () => import('@/views/demos/DateDemoPage.vue')
                },
                {
                    path: 'csr-util',
                    name: 'demo-csr-util',
                    meta: {
                        title: 'CSRUtil.js Demo',
                    },
                    component: () => import('@/views/demos/CSRUtilDemoPage.vue')
                },
                {
                    path: 'utility',
                    name: 'demo-utility',
                    meta: {
                        title: 'utility.js Demo',
                    },
                    component: () => import('@/views/demos/UtilityDemoPage.vue')
                },
                {
                    path: 'validation',
                    name: 'demo-validation',
                    meta: {
                        title: 'validation.js Demo',
                    },
                    component: () => import('@/views/demos/ValidationDemoPage.vue')
                }
            ]
        }
    ]
    : []

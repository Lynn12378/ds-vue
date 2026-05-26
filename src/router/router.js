import BaseLayout from '@/components/BaseLayout.vue'

export const routes = [
    {
        // 此為首頁路由，請替勿在此路徑添加子路由
        path: '/',
        name: 'home',
    },
    {
        path: '/A3',
        name: '/A3',
        component: BaseLayout,
        children: [
            {
                path: 'DSA30900',
                name: 'DSA30900',
                component: () => import('@/views/A3/DSA30900.vue'),
            },
        ],
    },
];
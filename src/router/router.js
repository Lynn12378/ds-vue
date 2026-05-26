import BaseLayout from '@/components/BaseLayout.vue'

export const routes = [
    {
        // 此為首頁路由，請替勿在此路徑添加子路由
        path: '/',
        name: 'home',
    },
    // 請替換為實際路徑
    // {
    //     path: `{Module}`,
    //     name:  `/{Module}`,
    //     component: BasLayout,
    //     children: [
    //         {
    //             path: `{FileName}`
    //             name: `{FileName}`
    //             component: () => import('@/views/{Module}/{FileName}.vue')
    //         }
    //     ]
    // }
];
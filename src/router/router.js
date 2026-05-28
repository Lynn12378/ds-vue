import BaseLayout from '@/components/BaseLayout.vue'

export const routes = [
    {
        path: '',
        name: 'home',
        component: BaseLayout,
    },
    {
        path: '/A3',
        name: '/A3',
        component: BaseLayout,
        children: [
            {
                path: 'DSA30900',
                name: 'DSA30900',
                component: () => import('@/views/A3/DSA30900.vue')
            }
        ]
    },
    // 其他業務路由請依照以下範例格式新增路由，並替換路徑、名稱與元件引用路徑
    // {
    //     path: {Module},
    //     name:  /{Module},
    //     component: BaseLayout,
    //     children: [
    //         {
    //             path: {FileName}
    //             name: {FileName}
    //             component: () => import('@/views/{Module}/{FileName}.vue')
    //         }
    //     ]
    // }
]
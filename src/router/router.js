const routes = [
    {
        path: '/A3',
        name: '/A3',
        children: [
            {
                path: 'DSA30900',
                name: 'DSA30900',
                component: () => import('@/views/A3/DSA30900.vue')
            }
        ]
    }
];

export default { routes };

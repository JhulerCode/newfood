import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/', redirect: { name: 'ConsolaView' } },
	{
		path: '/sign-in',
		name: 'SignIn',
		meta: { title: 'Sign In - Eko Business' },
		component: () => import('@/views/_signin/SignIn.vue'),
	},
	{
		path: '/consola',
		name: 'ConsolaView',
		meta: { title: 'Consola - Eko Business' },
		component: () => import('@/views/_consola/ConsolaView.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

router.beforeEach((to, from, next) => {
	const title = to.meta.title
	if (title) document.title = title
	next()
})

export default router


// import { createRouter, createWebHistory } from 'vue-router'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     // { path: '/', redirect: { name: 'ConsolaView' } },
//     {
//       path: '/sign-in',
//       name: 'SignIn',
//       component: () => import('@/views/_signin/SignIn.vue'),
//     },
//     {
//       path: '/consola',
//       name: 'ConsolaView',
//       component: () => import('@/views/_consola/ConsolaView.vue'),
//     },
//   ],
// })

// export default router
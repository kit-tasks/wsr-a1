import { callData } from './api.js'
import { personal } from './components/0_personal.js'
import { time } from './components/1_time.js'
import { token } from './components/2_token.js'
import { request } from './components/3_request.js'

const routes = [
    { path: '/', component: personal },
    { path: '/time', component: time },
    { path: '/token', component: token },
    { path: '/request', component: request },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

export const app = Vue.createApp({})
app.use(router)
app.mount('#app')

app.config.globalProperties.status = 'null'

async function login() {
    const res1 = await ethereum.request({
        method: 'eth_requestAccounts',
    })
    app.config.globalProperties.address = res1[0]
    const res2 = await callData('getRoleID', res1[0])
    app.config.globalProperties.status = res2.data
}

login()

ethereum.on('accountsChanged', () => {
    login()
})

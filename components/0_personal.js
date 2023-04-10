import { app } from '../app.js'
import { callData, buildRequest } from '../api.js'
export const personal = {
    template: `
    <div className="container mh">
        <div className="form-group">
            <div className="form-group">
                <div className="row">
                    <p className="header"><strong>{{header}}</strong></p></div>
                <div className="rounded row-block">
                    <div className="row">
                        <label htmlFor="" className="col-sm-4">Адрес:</label>
                        <label htmlFor="" className="col-sm-4">{{address}}</label></div>
                    <div className="row">
                        <label htmlFor="" className="col-sm-4">Баланс ETH:</label>
                        <label htmlFor="" className="col-sm-4">{{eth_balance}}</label></div>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Баланс CMON:</label>
                        <label htmlFor="" className="col-sm-4">{{cmon_balance}}</label></div>
                    <div className="row">
                        <label htmlFor="" className="col-sm-4">Обновить данные</label>
                        <button className="btn btn-primary col-sm-2">call</button></div>
                </div>
            </div>
            <div v-if="status=='null'" className="form-group">
                <div className="row"></div>
            </div>
            <div v-if="status=='1'" className="form-group">
            <div className="rounded row-block">
                <p>
                    <strong>Инициализировать контракт</strong>
                </p>
                <button className="btn btn-danger" @click="init()">send</button>
            </div>
                <div className="rounded row-block">
                    <p><strong>Узнать баланс</strong></p>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Адрес пользователя</label>
                        <div className="col-sm-8"><input type="text" className="form-control" id="balanceOf_owner"/></div></div>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Баланс пользователя:</label>
                        <label htmlFor="" className="col-sm-4">{{user_balance}}</label></div>
                    <button className="btn btn-primary" @click="balanceOf()">call</button>
                </div>
            </div>
            <div v-if="status=='2'" className="form-group">
                <div className="rounded row-block">
                    <p>
                        <strong>Получить запросы</strong>
                    </p>
                    <button className="btn btn-primary" @click="getRequests()">call</button>
                </div>
                <div v-for="item in requests" className="rounded row-block">
                    <div className="row"><label htmlFor="" className="col-sm-4">id:</label><label htmlFor="" className="col-sm-4">{{item[0]}}</label></div>
                    <div className="row"><label htmlFor="" className="col-sm-4">name:</label><label htmlFor="" className="col-sm-4">{{item[1]}}</label></div>
                    <div className="row mb"><label htmlFor="" className="col-sm-4">address:</label><label htmlFor="" className="col-sm-4">{{item[2]}}</label></div>
                    <button className="btn btn-primary col-sm-2 mr" @click="answerRequest(item[0], true)">accept</button>
                    <button className="btn btn-danger  col-sm-2 mr" @click="answerRequest(item[0], false)">reject</button>
                </div>
            </div>
            <div v-if="status=='3'" className="form-group">
                <div className="rounded row-block">
                    <p class="mb">
                        <strong>Наградить токенами CMON</strong>
                    </p>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Адрес получателя:</label>
                        <div className="col-sm-8"><input type="text" className="form-control" id="reward_to"/></div>
                    </div>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Количество CMON:</label>
                        <div className="col-sm-8"><input type="text" className="form-control" id="reward_amount"/></div>
                    </div>
                    <button className="btn btn-danger" @click="reward()">send</button>
                </div>
                <div className="rounded row-block">
                    <p class="mb">
                        <strong>Установить стоимость покупки CMON</strong>
                    </p>
                    <div className="row mb">
                        <label htmlFor="" className="col-sm-4">Сумма в ETH</label>
                        <div className="col-sm-8"><input type="text" className="form-control" id="setCost_newCost"/></div>
                    </div>
                    <button className="btn btn-danger" @click="setCost()">send</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            header: 'Личный кабинет',
            address: '',
            status: 'null',
            eth_balance: 0,
            cmon_balance: 0,
            user_balance: 0,
            requests: [],
        }
    },
    methods: {
        async login() {
            const res1 = await ethereum.request({
                method: 'eth_requestAccounts',
            })
            this.address = res1[0]
            const res2 = await callData('getRoleID', this.address)
            this.status = res2.data
            const res3 = await callData('balanceOf', this.address)
            this.eth_balance = res3.data
            const res4 = await callData('balanceOfETH', this.address)
            this.cmon_balance = res4.data
        },
        calcHeader() {
            switch (this.status) {
                case 'null':
                    this.header = 'Личный кабинет'
                    break
                case '0':
                    this.header = 'Личный кабинет User'
                    break
                case '1':
                    this.header = 'Личный кабинет Owner'
                    break
                case '2':
                    this.header = 'Личный кабинет Private'
                    break
                case '3':
                    this.header = 'Личный кабинет Public'
                    break
            }
        },
        // owner
        async balanceOf() {
            const res = await callData(
                'balanceOf',
                document.getElementById('balanceOf_owner').value
            )
            console.log(res)
            this.user_balance = res.data
        },
        async init() {
            const res = await buildRequest(
                'init',
                app.config.globalProperties.address,
                0
            )
            console.log(res)
            ethereum.request(res)
        },
        // private
        async getRequests() {
            const res = await callData('getRequests')
            console.log(res)
            this.requests = res.data
        },
        async answerRequest(reqID, answer) {
            const res = await buildRequest(
                'answerRequest',
                app.config.globalProperties.address,
                0,
                reqID,
                answer
            )
            console.log(res)
            ethereum.request(res)
        },
        // public
        async reward() {
            const res = await buildRequest(
                'reward',
                app.config.globalProperties.address,
                0,
                document.getElementById('reward_to').value,
                document.getElementById('reward_amount').value
            )
            console.log(res)
            ethereum.request(res)
        },
        async setCost() {
            const newCost = (
                BigInt(document.getElementById('setCost_newCost').value) *
                BigInt(10 ** 18)
            ).toString()
            console.log(newCost)
            const res = await buildRequest(
                'setCost',
                app.config.globalProperties.address,
                0,
                newCost
            )
            console.log(res)
            ethereum.request(res)
        },
    },
    async mounted() {
        this.address = app.config.globalProperties.address
        this.status = app.config.globalProperties.status
        ethereum.on('accountsChanged', async () => {
            await this.login()
            this.calcHeader()
        })
        await this.login()
        this.calcHeader()
    },
}

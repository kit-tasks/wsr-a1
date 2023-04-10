import { app } from '../app.js'
import { callData, buildRequest } from '../api.js'
export const token = {
    template: `
    <div className="container mh">
        <div className="form-group">
            <p className="header"><strong>Управление токеном</strong></p>
            <div className="rounded row-block">
                <p className="mb"><strong>Узнать баланс</strong></p>
                <div className="row mb"><label htmlFor="" className="col-sm-4">Баланс CMON:</label><label htmlFor="" className="col-sm-4">{{cmon_balance}}</label></div>
                <button className="btn btn-primary" @click="balanceOf()">call</button>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Перевести</strong></p>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Адрес получателя:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="transfer_to"/></div>
                </div>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Сумма CMON:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="transfer_amount"/></div>
                </div>
                <button className="btn btn-danger" @click="transfer()">send</button>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Перевести со счета доверителя</strong></p>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Адрес доверителя:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="transferFrom_from"/></div>
                </div>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Адрес получателя:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="transferFrom_to"/></div>
                </div>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Сумма CMON:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="transferFrom_amount"/></div>
                </div>
                <button className="btn btn-danger" @click="transferFrom()">send</button>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Доверить токены CMON</strong></p>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Адрес расточителя:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="approve_spender"/></div>
                </div>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Сумма для трат:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="approve_amount"/></div>
                </div>
                <button className="btn btn-danger" @click="approve()" >send</button>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Купить токены CMON</strong></p>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Сумма покупки:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="buy_amount"/></div>
                </div>
                <button className="btn btn-danger" @click="buy()">send</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            cmon_balance: 0,
        }
    },
    methods: {
        async balanceOf() {
            const res = await callData(
                'balanceOf',
                app.config.globalProperties.address
            )
            this.cmon_balance = res.data
        },
        async transfer() {
            const res = await buildRequest(
                'transfer',
                app.config.globalProperties.address,
                0,
                document.getElementById('transfer_to').value,
                document.getElementById('transfer_amount').value
            )
            console.log(res)
            ethereum.request(res)
        },
        async transferFrom() {
            const res = await buildRequest(
                'transferFrom',
                app.config.globalProperties.address,
                0,
                document.getElementById('transferFrom_from').value,
                document.getElementById('transferFrom_to').value,
                document.getElementById('transferFrom_amount').value
            )
            console.log(res)
            ethereum.request(res)
        },
        async approve() {
            const res = await buildRequest(
                'approve',
                app.config.globalProperties.address,
                0,
                document.getElementById('approve_spender').value,
                document.getElementById('approve_amount').value
            )
            console.log(res)
            ethereum.request(res)
        },
        async buy() {
            const res1 = await callData('getCost')
            if (res1.error) {
                alert(res1.error)
                throw new Error(res1.error)
            }
            console.log(res1)
            let cost = res1.data
            let buyAmount = BigInt(
                document.getElementById('buy_amount').value * cost
            ).toString()
            const res2 = await buildRequest(
                'buy',
                app.config.globalProperties.address,
                buyAmount
            )
            console.log(res2)
            ethereum.request(res2)
        },
    },
    mounted() {},
}

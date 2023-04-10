import { app } from '../app.js'
import { callData, buildRequest } from '../api.js'
export const request = {
    template: `
    <div className="container mh">
        <div className="form-group">
            <p className="header"><strong>Подать заявку</strong></p>
            <div className="rounded row-block">
                <p className="mb"><strong>Отправить запрос на вступление в whitelist</strong></p>
                <div className="row mb">
                    <label htmlFor="" className="col-sm-4">Имя:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="sendRequest_name"/></div>
                </div>
                <button className="btn btn-danger" @click="sendRequest()">send</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {}
    },
    methods: {
        async sendRequest() {
            const res = await buildRequest(
                'sendRequest',
                app.config.globalProperties.address,
                0,
                document.getElementById('sendRequest_name').value
            )
            console.log(res)
            ethereum.request(res)
        },
    },
    mounted() {},
}

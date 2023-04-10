import { app } from '../app.js'
import { callData, buildRequest } from '../api.js'
export const time = {
    template: `
    <div className="container mh">
        <div className="form-group">
            <div className="row">
                <p className="header"><strong>Управление временем</strong></p>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Узнать статус времени</strong></p>
                <div className="row"><label htmlFor="" className="col-sm-4">time_now:</label><label htmlFor="" className="col-sm-4">{{time_now}}</label></div>
                <div className="row"><label htmlFor="" className="col-sm-4">time_start:</label><label htmlFor="" className="col-sm-4">{{time_start}}</label></div>
                <div className="row"><label htmlFor="" className="col-sm-4">time_system:</label><label htmlFor="" className="col-sm-4">{{time_system}}</label></div>
                <div className="row mb"><label htmlFor="" className="col-sm-4">time_dif:</label><label htmlFor="" className="col-sm-4">{{time_dif}}</label></div>
                <div className="row mb"><label htmlFor="" className="col-sm-4">state:</label><label htmlFor="" className="col-sm-4">{{state}}</label></div>
                <button className="btn btn-primary" @click="getState()">call</button>
            </div>
            <div className="rounded row-block">
                <p className="mb"><strong>Изменить time_dif</strong></p>
                <div className="row mb">    
                    <label htmlFor="" className="col-sm-4">Новое значение time_dif:</label>
                    <div className="col-sm-8"><input type="text" className="form-control" id="setTimeDif_inMinutes"/></div>
                </div>
                <button className="btn btn-danger" @click="setTimeDif()">send</button>
            </div>
        </div>
    </div>        
    `,
    data() {
        return {
            time_now: 0,
            time_start: 0,
            time_dif: 0,
            time_system: 0,
            state: 'notstarted',
        }
    },
    methods: {
        async getState() {
            const res = await callData('getState')
            console.log(res)
            this.time_now = res.data[0]
            this.time_start = res.data[1]
            this.time_dif = res.data[2]
            this.time_system = res.data[3]
            switch (res.data[4]) {
                case '0':
                    this.state = 'notstarted'
                    break
                case '1':
                    this.state = 'seed'
                    break
                case '2':
                    this.state = 'privatePhase'
                    break
                case '3':
                    this.state = 'publicPhase'
                    break
            }
        },
        async setTimeDif() {
            const res = await buildRequest(
                'setTimeDif',
                app.config.globalProperties.address,
                0,
                document.getElementById('setTimeDif_inMinutes').value
            )
            console.log(res)
            ethereum.request(res)
        },
    },
    mounted() {
        this.getState()
    },
}

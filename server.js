const express = require('express')
const web3 = require('./web3')
const deploy = require('./deploy')
const { abi } = require('./bin/contracts/CMON.json')
const app = express()

let contractAddress
let contract
deploy().then((addr) => {
    contractAddress = addr
    contract = new web3.eth.Contract(abi, addr)
    console.log(addr)
})

function parseArgs(rowArgs) {
    if (rowArgs == 'null') {
        return 'null'
    } else {
        let args = rowArgs.split('$')
        for (let i = 0; i < args.length; i++) {
            args[i] =
                args[i] == 'true' ? true : args[i] == 'false' ? false : args[i]
        }
        return args
    }
}

app.get('/', (req, res) => {
    let body = {}
    try {
        res.sendFile(`${__dirname}/index.html`)
    } catch (e) {
        console.log(e)
        body.error = e.message
        res.json(body)
    }
})

app.get('/callData', async (req, res) => {
    let body = {}
    try {
        const { method, args } = req.query
        const parsedArgs = parseArgs(args)
        const myMethod =
            parsedArgs == 'null'
                ? contract.methods[method]()
                : contract.methods[method](...parsedArgs)
        const data = await myMethod.call()
        body.data = data
    } catch (e) {
        console.log(e)
        body.error = e.message
    }
    res.json(body)
})

app.get('/encodeABI', async (req, res) => {
    let body = {}
    try {
        const { method, args } = req.query
        const parsedArgs = parseArgs(args)
        const myMethod =
            parsedArgs == 'null'
                ? contract.methods[method]()
                : contract.methods[method](...parsedArgs)
        const data = await myMethod.encodeABI()
        body.data = data
    } catch (e) {
        console.log(e)
        body.error = e.message
    }
    res.json(body)
})

app.get('/estimateGas', async (req, res) => {
    let body = {}
    try {
        const { method, from, value, args } = req.query
        const parsedArgs = parseArgs(args)
        const myMethod =
            parsedArgs == 'null'
                ? contract.methods[method]()
                : contract.methods[method](...parsedArgs)
        const data = await myMethod.estimateGas({ from, value }).catch((e) => {
            console.log(e)
            body.error = e.message
        })
        body.data = data
    } catch (e) {
        console.log(e)
        body.error = e.message
    }
    res.json(body)
})

app.get('/contractAddress', (req, res) => {
    let body = {}
    try {
        body.data = contractAddress
    } catch (e) {
        console.log(e)
        body.error = e.message
    }
    res.json(body)
})

app.get('/*', (req, res) => {
    let body = {}
    try {
        res.sendFile(`${__dirname}${req.url}`)
    } catch (e) {
        console.log(e)
        body.error = e.message
        res.json(body)
    }
})

app.listen(8080)

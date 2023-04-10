const { abi, bytecode } = require('./bin/contracts/CMON.json')
const web3 = require('./web3')
const addr = '0x8a6Dc83c48829e6AA19bb457C7ADe3A83CbbDE40'

async function deploy() {
    await web3.eth.personal.unlockAccount(addr, '1111', 9999999)
    const factory = new web3.eth.Contract(abi)
    let txHash
    await factory
        .deploy({ data: bytecode })
        .send({ from: addr }, (err, _txHash) => {
            txHash = _txHash
        })
    const receipt = await web3.eth.getTransactionReceipt(txHash)
    return receipt.contractAddress
}

module.exports = deploy

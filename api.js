async function contractAddress() {
    return await fetch(`/contractAddress`).then((res) => {
        return res.json()
    })
}
async function encodeABI(method, ...args) {
    return await fetch(
        `/encodeABI?method=${method}&args=${args == '' ? null : args.join('$')}`
    ).then((res) => {
        return res.json()
    })
}
async function estimateGas(method, from, value, ...args) {
    return await fetch(
        `/estimateGas?method=${method}&from=${from}&value=${value}&args=${
            args == '' ? null : args.join('$')
        }`
    ).then(async (res) => {
        return res.json()
    })
}

export async function callData(method, ...args) {
    return await fetch(
        `/callData?method=${method}&args=${args == '' ? null : args.join('$')}`
    ).then((res) => {
        return res.json()
    })
}
async function getOrError(f, ...args) {
    const res = await f(...args)
    if (res.error) {
        console.error(res.error)
        alert(res.error)
        throw new Error(res.error)
    }
    return res.data
}

export async function buildRequest(method, from, value, ...args) {
    const to = await getOrError(contractAddress)

    const data = await getOrError(encodeABI, method, ...args)
    const chainId = '0x900'
    console.log(method, from, value, ...args)
    const estimated = await getOrError(
        estimateGas,
        method,
        from,
        value,
        ...args
    )
    console.log(BigInt(value).toString(16), value)
    return {
        method: 'eth_sendTransaction',
        params: [
            {
                from,
                to,
                value: BigInt(value).toString(16),
                data,
                chainId,
            },
        ],
    }
}

import dotenv from 'dotenv'
dotenv.config()

import { getContractCallQuote } from './api'
import { ethStakingCall } from './contractCalls/ethStaking';
import { stETHWrappingCall } from './contractCalls/stETHWrapping';
import { ETH_ON_MAINNET, OP_GOVERNANCE_ON_OPTIMISM } from './commonAddresses';
import { passThrough, prettyPrintLifiStep, saveToFile } from './utils';

const main = async () => {
    const amount = 100000000000001n
    const [call1, call2] = [ethStakingCall(amount), stETHWrappingCall(amount-BigInt(1))]

    console.log(`🚀 Requesting quote...`)

    return getContractCallQuote({
        "fromChain": 10,
        "fromToken": OP_GOVERNANCE_ON_OPTIMISM,
        "fromAddress": "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0",
        "toChain": 1,
        "toAmount": "100000000000001",
        "toToken": ETH_ON_MAINNET,
        "contractCalls": [call1, call2],
        "slippage": 0.03,
        "integrator": "muc-hackaton-postman"
    })
}

main()
.then(passThrough(prettyPrintLifiStep))
.then(saveToFile)
.then(() => console.log(`✅ All done!`))
.catch((e) => console.log(`💀 Error in preparing lifi step: ${e}`))
.finally(() => process.exit(0))
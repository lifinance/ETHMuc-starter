import { LifiStep } from "@lifi/types"
import BigNumber from "bignumber.js"
import { hexToBigInt } from "viem"
import fs from 'fs'

const FILENAME = 'lifistep.json'

export const prettyPrintLifiStep = (step: LifiStep): Promise<LifiStep> => {
    console.log('LifiStep summary: ')
    const messageValue = new BigNumber(hexToBigInt(step.transactionRequest!.value).toString()).shiftedBy(-18).toFixed(6)
    const ethPrice = Number(step.estimate.gasCosts![0].token.priceUSD)
    const data = {
        fromToken: step.action.fromToken.symbol,
        fromAmount: `${step.action.fromAmount} (${step.estimate.fromAmountUSD ?? '??'}$)`,
        toToken: step.action.toToken.symbol,
        messageValue: `${messageValue} ETH (${Number(messageValue.toString()) * ethPrice}$)`,
        estimatedGasCost: step.estimate.gasCosts ? `${step.estimate.gasCosts[0].amountUSD}$` : 'Unknown'
    }
    console.table(data)
    return Promise.resolve(step)
}

export const saveToFile = (step: LifiStep): void => {
    console.log(`💾 Saving step as ${FILENAME}`)
    fs.writeFileSync(FILENAME, JSON.stringify(step))
}
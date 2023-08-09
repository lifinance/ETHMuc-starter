import dotenv from 'dotenv'
dotenv.config()

import { ChainId, LifiStep } from '@lifi/types'
import { Address, FormattedTransactionRequest, TransactionReceipt, createWalletClient, encodeFunctionData, hexToBigInt, http, parseAbiItem, parseGwei, zeroAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as Chains from 'viem/chains'
import { Chain } from 'viem/chains'
import { waitForTransactionReceipt } from 'viem/actions'
import TxToSend from './tx.to.send.json'

type LifiTransactions = {
    mainTxRequest: (FormattedTransactionRequest & { chainId: ChainId }),
    approvalTxRequest: (FormattedTransactionRequest & { chainId: ChainId }) | undefined
}

const chainIdToChain = (chainId: ChainId): Chain | never => {
    const chain = Object.values(Chains).find(({ id }) => id === chainId)
    if (!chain) throw new Error(`Could not find viem chain for chain ID: ${chainId}`)
    return chain
} 

const parseLifiStep = (lifiStep: object): LifiStep | never => {
    if (!('action' in lifiStep)) throw new Error(`'action' missing from lifi step.`)
    if (!('estimate' in lifiStep)) throw new Error(`'estimate' missing from lifi step.`)
    if (!('transactionRequest' in lifiStep)) throw new Error(`'transactionRequest' missing from lifi step.`)
    if (!('integrator' in lifiStep)) throw new Error(`'integrator' missing from lifi step.`)
    if (!(('type' in lifiStep) && lifiStep.type === 'lifi')) throw new Error(`Not a lifi step`)
    return lifiStep as LifiStep
}

const buildApproval = (onChain: ChainId, forToken: Address, forAmount: string, spender: Address) => {
    const functionSignature = parseAbiItem('function approve(address spender, uint256 amount) returns (bool)')
    const callData = encodeFunctionData({
        abi: [functionSignature],
        args: [spender, BigInt(forAmount)]
    })
    return {
        data: callData!,
        chainId: onChain,
        to: forToken
    }
}

const parseInputs = async (input: object): Promise<LifiTransactions> => {
    const lifiStep = parseLifiStep(input)

    const tokenApproval = lifiStep.action.fromToken.address !== zeroAddress ? {
        tokenAddress: lifiStep.action.fromToken.address as Address,
        tokenAmount: lifiStep.action.fromAmount,
        approveTo: lifiStep.estimate.approvalAddress as Address
    } : undefined
    
    return {
        mainTxRequest: lifiStep.transactionRequest!,
        approvalTxRequest: tokenApproval ?
            {
                ...buildApproval(
                    lifiStep.action.fromChainId,
                    tokenApproval.tokenAddress,
                    tokenApproval.tokenAmount,
                    tokenApproval.approveTo
                ),
                from: lifiStep.transactionRequest!.from
            } : undefined
    }

}

const sendTransaction = async (transactionRequest: FormattedTransactionRequest & { chainId: ChainId }): Promise<TransactionReceipt> => {
    const walletClient = createWalletClient({
        chain: chainIdToChain(transactionRequest.chainId),
        transport: http(),
        account: privateKeyToAccount(
            process.env.WALLET_PRIVATE_KEY as `0x${string}`
        )
    })
    const hash = await walletClient.sendTransaction(transactionRequest)
    return await waitForTransactionReceipt(walletClient, { hash, timeout: 60_000 })
}

const main = async (lifiTxs: LifiTransactions) => {
    if (lifiTxs.approvalTxRequest) {
        console.log(`⏳ Sending approval tx`)
        await sendTransaction(lifiTxs.approvalTxRequest)
        console.log(`🆗 Approval sent`)
    }

    console.log(`⏳ Sending main transaction`)
    const receipt = await sendTransaction(lifiTxs.mainTxRequest)
    console.log(`🆗 Transaction sent`)
    return receipt.transactionHash
}

// Remove gasPrice for chains that we know support EIP1559.
// Viem will take care of including the correct fees.
const conformToEIP1559 = (txs: LifiTransactions) => {
    // Not a complete list!
    const EIP1559Chains = [ChainId.OPT, ChainId.ARB, ChainId.ETH, ChainId.POL]
    const isToEIP1559Chain = EIP1559Chains.includes(txs.mainTxRequest.chainId)
    return {
        ...txs,
        mainTxRequest: {
            ...txs.mainTxRequest,
            gasPrice: isToEIP1559Chain
                // Let viem calculate its own fees following EIP1559
                ? undefined :
                // Or use the provided gasPrice
                BigInt(hexToBigInt(txs.mainTxRequest.gasPrice as unknown as `0x${string}`)),
        }
    } as LifiTransactions
}

// Viem wants the values to be in bigint format
const valueToInt = (txs: LifiTransactions) => {
    return {
        ...txs,
        mainTxRequest: {
            ...txs.mainTxRequest,
            // Let viem calculate its own fees following EIP1559
            value: txs.mainTxRequest.value ? hexToBigInt(
                txs.mainTxRequest.value as unknown as `0x${string}`
            ) : undefined
        }
    } as LifiTransactions
}

parseInputs(TxToSend)
.then(conformToEIP1559)
.then(valueToInt)
.then(main)
.then((hash) => console.log(`✅ All done, tx hash: ${hash}`))
.catch((e) => console.log(`💀 Error while sending transaction: ${e}`))
.finally(() => process.exit(0))
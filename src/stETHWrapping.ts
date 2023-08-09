import { ContractCall } from "@lifi/types"
import { encodeFunctionData, parseAbiItem } from "viem"
import { STETH_ON_MAINNET, WSTETH_ON_MAINNET } from "./commonAddresses"

export const stETHWrappingCall = (amount: bigint): ContractCall => {

    const functionSignature = parseAbiItem('function wrap(uint256) returns (uint256)')

    return {
        fromAmount: amount.toString(),
        fromTokenAddress: STETH_ON_MAINNET,
        toTokenAddress: WSTETH_ON_MAINNET,
        toContractAddress: WSTETH_ON_MAINNET,
        toContractCallData: encodeFunctionData({
            abi: [functionSignature],
            args: [amount]
        }),
        toContractGasLimit: '100000'
    }
}
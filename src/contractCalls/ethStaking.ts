import { ContractCall } from "@lifi/types"
import { STETH_ON_MAINNET } from "../commonAddresses"
import { zeroAddress } from "viem"

export const ethStakingCall = (amount: bigint): ContractCall => {
    return {
        fromTokenAddress: zeroAddress,
        toTokenAddress: STETH_ON_MAINNET,
        toContractAddress: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        toContractCallData: '0x',
        fromAmount: amount.toString(),
        toContractGasLimit: "110000"
    }
}

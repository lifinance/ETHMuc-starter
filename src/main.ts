import dotenv from 'dotenv'
dotenv.config()

import { getContractCallQuote } from './api'
import { passThrough, prettyPrintLifiStep, saveToFile } from './utils';
import { ContractCallQuoteRequest } from '@lifi/types';

const main = async () => {
    console.log(`🚀 Requesting quote...`)
    return getContractCallQuote({} as ContractCallQuoteRequest)
}

main()
.then(passThrough(prettyPrintLifiStep))
.then(saveToFile)
.then(() => console.log(`✅ All done!`))
.catch((e) => console.log(`💀 Error in preparing lifi step: ${e}`))
.finally(() => process.exit(0))
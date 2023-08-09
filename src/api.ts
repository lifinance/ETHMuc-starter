import { ContractCallQuoteRequest, LifiStep } from "@lifi/types";

const BASE_API = 'https://hackatonmuc.li.quest'
const AUTH_HEADER = { 'x-lifi-api-key' : process.env.API_KEY! }

export const getContractCallQuote = (request: ContractCallQuoteRequest): Promise<LifiStep> => {
    return fetch(`${BASE_API}/v1/quote/contractCall`, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...AUTH_HEADER }
    }).then((data) => data.json())
}
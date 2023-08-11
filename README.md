## What is this 

This is a repository meant to function as a starter project for the hackaton @ETHMunich.

## Setup

You will need to firstly rename `.env.template` (found at the top level of the repo) to `.env`, secondly, fill in the missing values.
Information about the API key will be provided in the talk.

## What can I run

### Request a contract call(s) quote

Running `pnpm start` will request a contract call quote for `OP (OPT) => ETH (ETH) => stETH (ETH) => wstETH (ETH)` and save it as `lifistep.json` at the root directory of this repo.

### Execute a LifiStep

Running `pnpm sendTx` will attempt sending a transaction that will execute the LI.FI step specified in `src/scripts/tx.to.send.json`

### Useful links

LI.FI Hackaton [postman collection](https://www.postman.com/lifinance/workspace/li-fi-hackaton)

[LI.FI Docs](https://docs.li.fi/)

[LI.FI API Docs](https://apidocs.li.fi/reference/welcome-to-the-lifinance-api)

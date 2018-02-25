# Hasty Ogre Name Service
A name service implementation built on the NEO blockchain. It serves to lower the barriers of entry with the every day user by making it easier to send and receive funds with any name you choose! While the standard addresses that we have today help to increase security, the name service builds upon that, by making it simple to share a reference to those addresses in a familiar and convenient way.
- Register unlimited names for every address you own
- Transfer names from address to address
- Unregister unwanted names
- Submit requests for taken names

### HONS token
The native token for the Hasty Ogre Name Service, it is currently used to pay for miniscule fees for name registration and transfer. This helps to reduce spamming and hoarding of mass amounts of names in the short term, and will serve as the medium of exchange for a decentralized names trading platform in the near future.

Name service fees are arbitrarily set to 10 HON to register, and 5 HON for each side of the transfer between sender and receiver of a name. Request side of name transactions will have fees in place to discourage spamming of requests for names across entire network.

##### Specifics
- Total supply 100m, 8 decimals
- Pre-allocation 3m
- Open exchange in perpetuity
  - 400 HONS/NEO and 200 HONS/gas
  - limited to 200k HON per addresses
  - Unlimited number of exchanges up to limit
- KYC disabled for testnet

### Transfer system
The name service implements a transfer system that requires both parties agreement to the transaction before it's finally settled. This way we can prevent malicious parties from purchasing strange names, and assigning them to their innocent victims. This mutual joint party transfer agreement pattern will serve as the one of the building blocks for the decentralized name exchange, and grow to support additional use-cases like escrow services or complex multi party sales agreements. In the near future I plan on adding offer amounts to request side transaction confirmations, to allow users to pre-authorize a name transfer with a pre-alloted HON amount that is placed in escrow at the time of offer. Similarly, name owners can place open pre-auth offers to anyone who is willing to pay the amount they have set on their name.

##### How does it work?
Either the name owner or requester can submit a transfer request. If neither of them has created a transfer request for that name, one will be created for the pair, with the caller's approval checked. The transfer will remain pending until the other party submits their transfer request. Only once both parties submit their agreements on the transfer, will the name reassignment take place. Subsequently their name management records will also be updated at the time of transfer.

### UI Sandbox
The service is in a very early stage of development, and provides a mvp sandbox to play around with not only account creation, sending and receiving assets and token, but also interacting with the different features of the name service by interacting with smart contracts on the NEO blockchain.
- Create new wallet addresses
- Import existing wallet addresses
- Send and receive NEO, GAS, & HONS
- Save wallet addresses in your local cache (for development purposes only, do not save real addresses here or repoint to mainnet, you've been warned)
- Save wallet cache clearing
- Remove specific wallets from list
- Auto-refresh for wallet balances and names management
- Look up wallet address by name, to send assets
- Register names
- Name management: transfer & removal

The interface screams MVP in it's current state, so be patient with transactions, as they are at the mercy of block times.

### 

## Roadmap
##### Smart Contract
- Clean up transfer code
- Create tests
- Build out names exchange based on transfer protocol
- Add transaction aggregation
- Improve transaction costs on transfers
- Improve data storage techniques, currently using serialized arrays and concat keys
- Make the transfer and agreements system more generic to support additional usecases

##### UI Sandbox
- UI queues for status of submitted requests
- Client-side transaction tracking and notification on change from autoupdate for each operation
- Make interface used to interact with HONS more generic to be used for all NEP5 token contracts
- Update token contract address configurable via UI to make development more convenient
- Name service transaction lifecycle
- Name exchange interface
  - Ranking, bid, sales explorer

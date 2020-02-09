# reactiveBlockchain

## Schema project

## Data Streams
The module provides three different type of datastream later explained. The first data stream is the outgoing stream from the blockchain. The information stored in the blockchain ledger could be present in this actual stream. The second stream is used to send information into the blockchain, meaning that you are actually going to send a new transaction to the blockchain. The last stream will be composed of history of blocks addition from the blockchain used to verify that new information sent to the blockchain has been approved and added in the ledger.

### Outgoing
This first stream of data will be filled with the information that is stored in the blockchain ledger. 

In order to use this stream, we assume the blockchain provides contracts that retrieve data from the blockchain. There are three different types of contracts:
1. Specific get contracts: allows to get one specific elem from the blockchain `getDiplomaID(ID)`
2. Contracts that retrieve all elem from a specific type of elem `getAllDiplomas()`
3. Contracts that retrieve the whole ledger from the blockchain `getAll()`

### Ingoing

### Blocks Stream

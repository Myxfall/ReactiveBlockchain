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

#### Running the project
There are two steps to retrieve data from the blockchain:
1. During the initialisation phase: when the project is started and retrieve the data already in the blockchain.
2. During the running phase: once the project is running and retrieve the new added data confirmed by the blockchain.

##### Initialisation Phase
When the project is started, the module has to retrieve the data that is already stored in the blockchain. The module will then call a a series of contracts that will fill in the data stream. For this you have to provide a *list* of contracts, with their arguments if necessary, that are going to be called. 

You have to specify the list of contracts that are going to be called by creation a *CONST* in your project and send it to the *getProxies* function provided by the module.

```java
const QUERY_CHAINCODE = [["queryAllDiplomas"], ["queryGrade", "GRADE10"], ["queryGrade", "GRADE56"]];

...

[...] = await reactiveProxyjs.getProxies(QUERY_CHAINCODE, ...);

```

### Ingoing

### Blocks Stream

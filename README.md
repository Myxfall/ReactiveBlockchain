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

##### Running Phase
Once the project is running and the data stream filled with the data already existing in the blockchain, the same datastream will be filled by the new information send to the blockchain. This is done by a listening process converted to the stream. For this the developpers **should** know their blockchain and the custom events specified in the contracts.

You just have to specify the specific events name and send it to the *getProxies* function.

```java
const EVENT_LISTENERS = ["diplomaEvent", "gradeEvent"];

...

[...] = await reactiveProxyjs.getProxies(..., EVENT_LISTENERS);

```

This function then returns the three datastream that you are going to interact with. The first one is the *queryProxy* filled with the data from the blockchain. This same stream is also now listening for future addition in the blockchain and will send these data to the same stream.

### Ingoing
This stream is used to send new data to the blockchain through the data stream. Since we are talking about blockchain and contracts, the data send should follows your contracts convention. In addition they should also specify the name of the contract you are going to call. All these information are stored in the *JSON* send through the stream. You then first have to specify the name of the contract you are going to call followed by the arguments of your contracts, following their specification order.

```java
json_to_send = {
        contractName: "createDiploma",
        args: {
            username: "your_username",
            school: "your_school",
            study: "your_study",
            first_name: "your_first_name",
            last_name: "your_last_name"
        }
    }
```

You then have to transmit this json object to the corresponding data stream
```java
invokeProxy.next(json_to_send);
```

### Blocks Stream

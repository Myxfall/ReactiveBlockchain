let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const util = require('util');


const port = process.env.PORT || 3000;

const { Subject, ReplaySubject, from, of, throwError, merge } = require("rxjs");
const { Observable } = require("rxjs/Observable");
const { catchError, map, reduce, scan, filter, take, delay } = require("rxjs/operators");


const reactiveProxyjs = require('../../fabric-samples/fabcar/javascript/reactiveProxy');

var blocksProxy;
var queryProxy;
var invokeProxy;

//const QUERY_CHAINCODE = ["queryAllData"];
const QUERY_CHAINCODE = [["queryAllDiplomas"], ["queryAllGrades"]];
//const QUERY_CHAINCODE = [["queryAllDiplomas"], ["queryCar", "CAR4"], ["queryCar", "CAR2"]];
const EVENT_LISTENERS = ["sent"];

// TODO: read more about example IBM usage of hyperleder

/* Done only once when the server is runned */
async function gatewayConnexion() {
	try {

		/*
			Example continuous query

			* Get grade of one student V
			* get diplomas of one unif V
			* get average grade of one unif V

		*/

 		// ===== TESTING NEW MAIN MODULE STREAM =====

		const hyperledgerProxy = await reactiveProxyjs.setupConnexion({
			user: 'user1',
			channel: 'mychannel',
			contract: 'fabcar'
		});

		/*
		const dataStream = reactiveProxyjs.dataProxy(hyperledgerProxy, {
			contract_name: "queryAllDiplomas",
			args: []
		});
		dataStream
		.subscribe({
			next(value) {
				console.log("MMMMMM VALUE FROM OBSERVABLE MMMMMM");
				console.log(value);
			},
			error(err) {
				console.log("\nMMMMMM Error stream dataProxy MMMMMM");
				console.log(err);
			},
			complete() {
				console.log("MMMMMM DataProxy Completed MMMMMM");
			}
		});
		*/

		// const pushQuery = await reactiveProxyjs.pushQuery(hyperledgerProxy,
		// 	{
		// 		select: "*",
		// 		from: ["newGrade"],
		// 		where: ["maxromai"]
		// 	}
		// );
		// pushQuery.subscribe({
		// 	next(value) {
		// 		console.log("MMMMM Continuous query Value MMMMM")
		// 		console.log(value);
		// 	}
		// });

		// const ppQuery = await reactiveProxyjs.ppQuery(hyperledgerProxy, {
		// 	select: "*",
		// 	from: ["newDiploma"],
		// 	where: ["maxromai"]
		// });
		// ppQuery
		// .pipe(filter(object => (object.username == "maxromai" || object.Record.first_name == "Maximilien")))
		// .subscribe({
		// 	next(value) {
		// 		console.log("MMMMM Past & Continuous Query value MMMMM");
		// 		console.log(value);
		// 	}
		// });
		const diplomasStream = await reactiveProxyjs.ppQuery(hyperledgerProxy, {
			select: "*",
			from: ["newDiploma"],
			fromStatic: ["queryAllDiplomas"],
		});
		diplomasStream
		.pipe(
			filter(object => object.Record.school == "VUB")
		)
		.subscribe({
			next(value) {
				console.log("MMMMM Filter one university MMMMM");
				console.log(value);
			}
		})

		const ppQueryBis = await reactiveProxyjs.ppQuery(hyperledgerProxy, {
			select: "*",
			from: ["newGrade", "changeGrade"],
			fromStatic: ["queryAllGrades"],
			where: ["maxromai"]
		});
		const averageGradeStudent = ppQueryBis.pipe(
			filter(object => object.first_name == "Maximilien" && object.last_name == "Romain"),
			scan((acc, curr) => {
				acc.push(Number(curr.grade));
				return acc;
			}, []),
			map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length)
		).subscribe({
			next(value) {
				console.log("MMMMMM MEAN average MMMMMM");
				console.log("Maximilien Romain has a GPA of :", value);
			}
		});
		const averageGrade = ppQueryBis.pipe(
			filter(object => object.school == "VUB"),
			scan((acc, curr) => {
				acc.push(Number(curr.grade));
				return acc;
			}, []),
			map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length)
		).subscribe({
			next(value) {
				console.log("MMMMMM MEAN average MMMMMM");
				console.log("VUB has a student average of :", value);
			}
		});

		// const streamProcessed = reactiveProxyjs.streamProcessing(hyperledgerProxy, {
		// 	select: ["first_name"],
		// 	from: [ppQuery, ppQueryBis],
		// 	where: ["maxromai"]
		// });
		// streamProcessed.subscribe({
		// 	next(value) {
		// 		console.log("MMMMM STREAM PROCESSING MMMMM");
		// 		console.log(value);
		// 	}
		// })



		/*
		const blockhistoryStream = reactiveProxyjs.blocksProxy(hyperledgerProxy);
		blockhistoryStream.subscribe({
			next(value) {
				console.log("===== BLOCKS HISTORY =====");
				console.log(value);
			}
		});
		*/

		// const test = reactiveProxyjs.testBlocks(hyperledgerProxy);
		// test.subscribe({
		// 	next(value) {
		// 		console.log("===== BLOCKS HISTORY =====");
		// 		console.log(value);
		// 	}
		// });

		/*
		const eventStream = reactiveProxyjs.eventProxy(hyperledgerProxy, 'sent');
		eventStream.subscribe({
			next(value) {
				console.log("===== GOT VALUE FROM LISTENER =====");
				const new_value = JSON.parse(value);
				console.log(new_value);
			}
		});
		*/

		/*
		const transactionStream = reactiveProxyjs.transactionProxy(hyperledgerProxy);
		transactionStream.subscribe({
			next(value) {
				console.log("\n=== TRANSACTION PROXY INDEX SUBSCRIBE ===");
				console.log(value);
			}
		})
		setTimeout(() => { transactionStream.next({
				contractName: "createDiploma",
				args: {
					username: "ERROR",
					school: "ICHEC",
					study: "Computer Science",
					first_name: "ERROR",
					last_name: "Romain",
					zoulou: "thang"
				}
			})}, 2500
		);
		//setTimeout(() => {transactionStream.complete()}, 10000);
		*/
		// setTimeout(async () => {
		// 	const txStream = await reactiveProxyjs.sendTransaction(hyperledgerProxy, {
		// 			/*contractName: "createDiploma",
		// 			args: {
		// 				username: "maxromai",
		// 				school: "ICHEC",
		// 				study: "theatre and being good",
		// 				first_name: "Maximilien",
		// 				last_name: "Romain",
		// 			}*/
		// 			contractName: "createGrade",
		// 			args: {
		// 				username: "maxromai",
		// 				course: "Be a GOOD boy",
		// 				grade: "15",
		// 				school: "ICHEC",
		// 				first_name: "Maximilien",
		// 				last_name: "Romain",
		// 			}
		// 		});
		// 	txStream
		// 	.pipe(
		// 		catchError(err =>  {
		// 			console.log("====== Handling error and rethrow it ======");
		// 			console.log(err);
		// 			return throwError(err);
		// 		})
		// 	)
		// 	.subscribe({
		// 		next(value) {
		// 			console.log("+++ index server : tx stream +++");
		// 			console.log(value);
		// 		},
		// 		error(err) {
		// 			console.log("+++ index server : error value +++");
		// 			console.log(err);
		// 		},
		// 		complete() {
		// 			console.log("+++ index tx stream completed +++");
		// 		}
		// 	});
		// }, 2500);
		// setTimeout(async () => {
		// 	const txStream = await reactiveProxyjs.sendTransaction(hyperledgerProxy, {
		// 			contractName: "createDiploma",
		// 			args: {
		// 				username: "maxromai",
		// 				school: "ICHEC",
		// 				study: "theatre and being good",
		// 				first_name: "Maximilien",
		// 				last_name: "Romain",
		// 			}
		// 		});
		// 	txStream
		// 	.pipe(
		// 		catchError(err =>  {
		// 			console.log("====== Handling error and rethrow it ======");
		// 			console.log(err);
		// 			return throwError(err);
		// 		})
		// 	)
		// 	.subscribe({
		// 		next(value) {
		// 			console.log("+++ index server : tx stream +++");
		// 			console.log(value);
		// 		},
		// 		error(err) {
		// 			console.log("+++ index server : error value +++");
		// 			console.log(err);
		// 		},
		// 		complete() {
		// 			console.log("+++ index tx stream completed +++");
		// 		}
		// 	});
		// }, 5000);

		const observable = new Observable(subscriber => {
			  subscriber.next(1);
			  subscriber.next(2);
			  subscriber.next(3);
		});
		const observableBis = new Observable(subscriber => {
			  subscriber.next(4);
			  subscriber.next(5);
			  subscriber.next(6);
		});
		const third = merge(
			observable,
			observableBis
		)
		// third.subscribe({
		// 	next(x) {
		// 		console.log(x)
		// 	}
		// });

		const testMerge = new ReplaySubject();
		const testarray = [third, testMerge];
		const merged = merge(
			...testarray
		);
		testMerge.next(10);
		testMerge.next(11);

		merged.subscribe({
			next(value) {
				console.log(value);
			}
		});

		//moduleStream = await reactiveProxyjs.getMainStream();

		// Throw error
		// moduleStream.next("Just a hello world");
		// // Send query to blockchain
		// moduleStream.next(queryDiploma = {
		// 	type: "query_blockchain",
		// 	contract_name: "queryCar",
		// 	args: ["CAR1"]
		// });
		// moduleStream.next(queryDiploma = {
		// 	type: "query_blockchain",
		// 	contract_name: "queryAllDiplomas",
		// 	args: []
		// });
		// const obs_test = of({
		// 	type: "test_JSON_stream",
		// 	contract_name: "just_something",
		// 	args: [1,2,3]
		// });
		// moduleStream.next({
		// 	type: "specific_test",
		// 	contract_name: "test_name",
		// 	args: obs_test
		// })

		// moduleStream.next({
		// 	type: "block_history"
		// })
		//
		// moduleStream.next({
		// 	type: "listen_blockchain",
		// 	eventName: "sent"
		// });

		// setTimeout(() => {  console.log("Delaying"); }, 5000);
		// setTimeout(() => {
		// 	moduleStream.next({
		// 		type: "invoke_blockchain",
		// 		contractName: "createDiploma",
		// 		args: {
		// 			username: "tperale",
		// 			school: "VUBBBB",
		// 			study: "Computer Science",
		// 			first_name: "Thomas",
		// 			last_name: "Perale"
		// 		}
		// 	})
		// }, 5000);




		// ===== END OF TESTING UNIT =====

		// [queryProxy, invokeProxy, blocksProxy] = await reactiveProxyjs.getProxies(QUERY_CHAINCODE, EVENT_LISTENERS);
		//
		// blocksProxy.subscribe({
		// 	next(value) {
		// 		console.log("Blocks Stream, got New block :");
		// 		var blocks_json = JSON.parse(value);
		// 		console.log(util.inspect(blocks_json.header, {showHidden: false, depth: 5}))
		//
		// 	},
		// 	eror(err) {
		// 		console.log("Blocks Stream : Something wrong happened with", err);
		// 	},
		// 	complete() {
		// 		console.log("Blocks Stream completed");
		// 	}
		// })

	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

/* Done everytime a user is connected to the front-end application */
function socketConnexion(socket) {
	// possibility to filter / map / delay the observable here and subscribe
	// to the new one. Any Client can then do whatever he wants to.

	//blockchainProxy = proxies[0].pipe(delay(2000));
	queryProxy.subscribe({
		next(value) {

			const new_value = JSON.parse(value);

			socket.emit('new-message', new_value);
			console.log(`Sending to socket connexion : ${value}\n`)
			//console.log(`Socket received from blockchain data with ${JSON.stringify(data)}`)
			//console.log(`submitting value : Socket ${socket.id} is sending ${data.message}`);
		},
		error(err) {
			io.emit('news', err);
		},
		complete() {
			io.emit('news', "Subject complete");
		}
	})
}

async function sendMessage(message) {
	try {
		//invokejs.main(contract, message);
		invokeProxy.next(message);

	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

async function sendDiploma(new_diploma) {
	try {
		invokeProxy.next(new_diploma);
	} catch (e) {
		console.error(`Failed to submit transaction with : ${e}`);
		process.exit(1);
	}
}

//proxyConnexion();
gatewayConnexion();
io.on('connection', (socket) => {
    console.log(`user connected with socket : ${socket.id}`);
	//socketConnexion(socket);

    socket.on('new-message', (message) => {
      console.log(`Server : Received new message with ${message}`);

      //io.emit('new-message', `server emission with ${io}`);
      //socket.emit('new-message', `socket emission with ${socket}`);
      sendDiploma(message);

    });
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

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
const { catchError, map, reduce, scan, filter, take, delay, mergeMap, groupBy, last } = require("rxjs/operators");


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
			* Get unif average : average student then average studentS -> not possible cause not tables / signals

			Blockchain specific
			* Send infos to blockchain & verify TX id from block streams
			* ?

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
		// const diplomasStream = await reactiveProxyjs.ppQuery(hyperledgerProxy, {
		// 	select: "*",
		// 	from: ["newDiploma"],
		// 	fromStatic: ["queryAllDiplomas"],
		// });
		// diplomasStream
		// .subscribe({
		// 	next(value) {
		// 		console.log("MMMMM Filter one university MMMMM");
		// 		console.log(value);
		// 	}
		// })
		//
		const ppQueryBis = await reactiveProxyjs.ppQuery(hyperledgerProxy, {
			select: "*",
			from: ["newGrade", "changeGrade"],
			fromStatic: ["queryAllGrades"],
			where: ["maxromai"]
		});
		// const averageGradeStudent = ppQueryBis.pipe(
		// 	filter(object => object.first_name == "Maximilien" && object.last_name == "Romain"),
		// 	scan((acc, curr) => {
		// 		acc.push(Number(curr.grade));
		// 		return acc;
		// 	}, []),
		// 	map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length)
		// ).subscribe({
		// 	next(value) {
		// 		console.log("MMMMMM MEAN average MMMMMM");
		// 		console.log("Maximilien Romain has a GPA of :", value);
		// 	}
		// });
		// const averageGrade = ppQueryBis.pipe(
		// 	filter(object => object.school == "VUB"),
		// 	scan((acc, curr) => {
		// 		acc.push(Number(curr.grade));
		// 		return acc;
		// 	}, []),
		// 	map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length)
		// ).subscribe({
		// 	next(value) {
		// 		console.log("MMMMMM MEAN average MMMMMM");
		// 		console.log("VUB has a student average of :", value);
		// 	}
		// });
		//
		const averageUniPerStudent = ppQueryBis.pipe(
			groupBy(gradeStudent => gradeStudent.username),
			mergeMap((student) => student.pipe(
				scan((acc, curr) => {
					acc.push(Number(curr.grade));
					return acc;
				}, []),
				map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length),
			))
		)
		averageUniPerStudent.subscribe({
			next(value) {
				console.log("===== UNIF STUDENT AVERAGE =====");
				console.log(value);
			}
		});
		const averageUniStudent = averageUniPerStudent.pipe(
			scan((acc, curr) => {
				acc.push(curr);
				return acc;
			}, []),
			map(arr => arr.reduce((acc, current) => acc + current, 0) / arr.length)
		).subscribe({
			next(value) {
				console.log("===== UNI AVERAGE =====");
				console.log(value);
			}
		});

		// const blockhistoryStream = reactiveProxyjs.blocksProxy(hyperledgerProxy);
		// blockhistoryStream.subscribe({
		// 	next(value) {
		// 		console.log("===== BLOCKS HISTORY =====");
		// 		//console.log(value.header);
		// 		if (value.data.data[0].payload.data.actions) {
		// 			console.log(value.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args)
		//
		// 			for (var i in value.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args) {
		// 				console.log(value.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[i].toString())
		// 			}
		// 		}
		// 		//console.log(value.data.data[0].payload.header.channel_header.tx_id);
		// 	}
		// });
		// const pushQuery = await reactiveProxyjs.pushQuery(hyperledgerProxy,
		// 	{
		// 		select: "*",
		// 		from: ["newGrade", "newDiploma"],
		// 		where: ["maxromai"]
		// 	}
		// );
		// pushQuery.subscribe({
		// 	next(value) {
		// 		console.log("mmmmm NEW VALUE mmmm");
		// 		console.log(value);
		// 	}
		// });
		// const testTxStream = reactiveProxyjs.transactionsProxy(hyperledgerProxy, blockhistoryStream, [pushQuery]);

		// ===== Building Table Stream =====
		ppQueryBis.subscribe({
			next(value) {
				console.log(value);
			}
		});
		const tableStream = reactiveProxyjs.tableProxy(hyperledgerProxy, {
			from: ppQueryBis,
			groupBy: ["username", "course"]
		});
		tableStream.subscribe({
			next(value) {
				console.log("===== Table Stream =====");
				console.log(value);
				var studentGrades = {};
				Object.keys(value).map((student) => {
					if (value[student].username in studentGrades) {
						studentGrades[value[student].username].push(value[student]);
					} else {
						studentGrades[value[student].username] = [value[student]];
					}
				})
				console.log(studentGrades);

				var totalMean = 0;
				var counter = 0;

				// ===== Calculate Mean of every student =====
				Object.keys(studentGrades).map((student) => {
					const grades = studentGrades[student];

					var mean = 0;
					for (grade in grades) {
						mean += Number(grades[grade].grade);
					}
					mean = mean / grades.length;
					console.log(student + " " + mean);
					totalMean += mean;
					counter += 1;
				})
				console.log("Students Mean : " + totalMean/counter);
			}
		})

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
		// }, 2000);

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

async function sendDiploma(new_diploma) {
	try {
		//invokeProxy.next(new_diploma);

		const txStreamb = await reactiveProxyjs.sendTransaction(hyperledgerProxy, new_diploma);
		const txStream = await reactiveProxyjs.sendTransaction(hyperledgerProxy, {
				contractName: "createDiploma",
				args: {
					username: "maxromai",
					school: "ICHEC",
					study: "theatre and being good",
					first_name: "Maximilien",
					last_name: "Romain",
				}
			});
		txStream
		.pipe(
			catchError(err =>  {
				console.log("====== Handling error and rethrow it ======");
				console.log(err);
				return throwError(err);
			})
		)
		.subscribe({
			next(value) {
				console.log("+++ index server : tx stream +++");
				console.log(value);
			},
			error(err) {
				console.log("+++ index server : error value +++");
				console.log(err);
			},
			complete() {
				console.log("+++ index tx stream completed +++");
			}
		});

	} catch (e) {
		console.error(`Failed to submit transaction with : ${e}`);
		process.exit(1);
	}
}

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

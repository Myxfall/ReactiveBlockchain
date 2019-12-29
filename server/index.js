let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const util = require('util');


const port = process.env.PORT || 3000;

const { Subject } = require("rxjs");
const { Observable } = require("rxjs/Observable");
const { map, filter, take, delay } = require("rxjs/operators");


const reactiveProxyjs = require('../../fabric-samples/fabcar/javascript/reactiveProxy');

var blocksProxy;
var queryProxy;
var invokeProxy;

//const QUERY_CHAINCODE = ["queryAllData"];
//const QUERY_CHAINCODE = [["queryAllDiplomas"], ["queryAllGrades"]];
const QUERY_CHAINCODE = [["queryAllDiplomas"], ["queryCar", "CAR4"], ["queryCar", "CAR2"]];
const EVENT_LISTENERS = ["sent"];

/* Done only once when the server is runned */
async function gatewayConnexion() {
	try {
		[queryProxy, invokeProxy, blocksProxy] = await reactiveProxyjs.getProxies(QUERY_CHAINCODE, EVENT_LISTENERS);

		blocksProxy.subscribe({
			next(value) {
				console.log("Blocks Stream, got New block :");
				var blocks_json = JSON.parse(value);
				console.log(util.inspect(blocks_json.header, {showHidden: false, depth: 5}))

			},
			eror(err) {
				console.log("Blocks Stream : Something wrong happened with", err);
			},
			complete() {
				console.log("Blocks Stream completed");
			}
		})

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
	socketConnexion(socket);

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

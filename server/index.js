let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;

const { Subject } = require("rxjs");
const { Observable } = require("rxjs/Observable");
const { map, filter, take, delay } = require("rxjs/operators");


const reactiveProxyjs = require('../../fabric-samples/fabcar/javascript/reactiveProxy');

var blockchainProxy;
var queryProxy;
var invokeProxy;
async function proxyConnexion() {
	try {

		proxies = await reactiveProxyjs.getProxies();
		blockchainProxy = proxies[0].pipe(delay(2000));
		//blockchainProxy = proxies[0];

		queryProxy = proxies[1];

		blockchainProxy.subscribe({
			next(value) {
				data = JSON.parse(value);

				//io.emit('news', data);
                io.emit('new-message', data.message);
				console.log(`submitting value : ${data.message}`);
			},
			error(err) {
				io.emit('news', err);
			},
			complete() {
				io.emit('news', "Subject complete");
			}
		})
		//queryProxy.next("Do something for me please");

	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

async function gatewayConnexion() {
	try {
		proxies = await reactiveProxyjs.getProxies();

		queryProxy = proxies[0];
		invokeProxy = proxies[1];

	} catch (error) {
		console.error(`Failed to submit transaction: ${error}`);
		process.exit(1);
	}
}

function socketConnexion(socket) {
	// possibility to filter / map / delay the observable here and subscribe
	// to the new one. Any Client can then do whatever he wants to.
	queryProxy.subscribe({
		next(value) {
			data = JSON.parse(value);

			socket.emit('new-message', `Socket ${socket.id} is sending ${data.message}`);
			console.log(`Socket received from blockchain data with ${JSON.stringify(data)}`)
			console.log(`submitting value : Socket ${socket.id} is sending ${data.message}`);
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

//proxyConnexion();
gatewayConnexion();
io.on('connection', (socket) => {
    console.log(`user connected with socket : ${socket.id}`);
	socketConnexion(socket);

    socket.on('new-message', (message) => {
      console.log(`Server : Received new message with ${message}`);

      //io.emit('new-message', `server emission with ${io}`);
      //socket.emit('new-message', `socket emission with ${socket}`);
      sendMessage(message);

    });
});


server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

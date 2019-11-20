let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

// test something on git

const port = process.env.PORT || 3000;

const { Subject } = require("rxjs");
const { Observable } = require("rxjs/Observable");
const { map, filter, take, delay } = require("rxjs/operators");


const reactiveProxyjs = require('../../fabric-samples/fabcar/javascript/reactiveProxy');

var blockchainProxy;
var queryProxy;
var invokeProxy;

var ids = {
	diplomas: 3,
	grades: 2
}

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
                io.emit('new-message', value);
				console.log(`----- Sending to socket connexion : ${data} ----- `);
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

/* Done only once when the server is runned */
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

/* Done everytime a user is connected to the front-end application */
function socketConnexion(socket) {
	// possibility to filter / map / delay the observable here and subscribe
	// to the new one. Any Client can then do whatever he wants to.
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

	  message["diplomaId"] = ids.diplomas;
	  ++ids.diplomas;

      //io.emit('new-message', `server emission with ${io}`);
      //socket.emit('new-message', `socket emission with ${socket}`);
      sendDiploma(message);

    });
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

const net = require('net');
const commands = require('./commands');
const timeout = require('./utils/timeout');
const message = require('./enums/messages');
require('./state');

const server = net.createServer(function(client) {
	const that = {};
	console.log('Client connected');
	timeout.runTimeout(that);

	client.buffer = '';
	client.on('data', function (data) {
		const lines = data.toString().split(/\n|\r/);
		let i, line;

		for (i = 0; i < lines.length - 1; i += 1) {
			line = client.buffer + lines[i];
			client.buffer = '';
			client.emit('message', line);
		}

		client.buffer += lines[lines.length - 1];
	});

	client.on('message', (data) => {
		console.log(`Raw message: ${data}`);
		const elements = data.split(" ");
		const prefix = elements[0].indexOf(':') === 0 ? elements[0] : null;
		const commandName = prefix ? elements[1] : elements[0];

		commands.forEach((command) => {
			if (command.test(commandName)) {
				command.run(that, ...elements.splice(prefix ? 2 : 1))
			}
		});
	});

	that.send = (data) => {
		console.log(`Raw: sending ${data}`);
		try {
			client.write(`${data}\r\n`);
		} catch (e) {
			console.log("Error, no connection anymore");
		}
	};

	that.sendMessage = (from, to, messageText) => that.send(`:${from} ${message.PRIVMSG} ${to} :${messageText}`);
});

server.listen(6667, '127.0.0.1');

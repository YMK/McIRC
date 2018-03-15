const net = require('net');
const commands = require('./commands');
const timeout = require('./utils/timeout');

const server = net.createServer(function(client) {
	console.log('Client connected');
	timeout.runTimeout(client);

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
				command.run()
			}
		});
	});
});

server.listen(6667, '127.0.0.1');

const net = require('net');
const server = net.createServer(function(client) {
	console.log('Client connected');

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


	client.on('message', (data) => console.log(data));
});

server.listen(6667, '127.0.0.1');

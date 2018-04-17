const net = require('net');
const client = net.connect({
	host: 'localhost',
	port: '6667'
});

client.pipe(process.stdout);

const replace = require('stream-replace');
process.stdin.pipe(replace('\n', '\r\n')).pipe(client);

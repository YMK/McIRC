var net = require('net');
var client = net.connect({
	host: 'localhost',
	port: '6667'
});

client.pipe(process.stdout);

var replace = require('stream-replace');
process.stdin.pipe(replace('\n', '\r\n')).pipe(client);

const net = require("net");
const client = net.connect({
	host: "localhost",
	port: "6667"
});
const readline = require("readline");
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

client.write("NICK test\r\n");
client.write("USER test 0 * :test user\r\n");

client.setEncoding("utf8");

client.on("data", (data) => {
	console.log(data);
	if (data.startsWith("PING")) {
		client.write("PONG\r\n");
	}
});

rl.on("line", (line) => {
	client.write(`${line}\r\n`);
})
const net = require("net");
const client = net.connect({
	host: "localhost",
	port: "6667"
});
const readline = require("readline");
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const username = process.argv.length > 2 ? process.argv[2] : "test";
client.setEncoding("utf8");

client.write(`NICK ${username}\r\n`);
client.write(`USER ${username} localhost * :Real name of user\r\n`);


client.on("data", (data) => {
	console.log(data);
	if (data.startsWith("PING")) {
		client.write("PONG\r\n");
	}
});

rl.on("line", (line) => {
	console.log(`Raw sending: ${line}`);
	client.write(`${line}\r\n`);
})
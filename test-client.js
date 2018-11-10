const net = require("net");
const client = net.connect({
	host: "localhost",
	port: "6667"
});
const readline = require("readline");
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const username = process.argv.length > 2 ? process.argv[2] : "test";
client.setEncoding("utf8");

client.on("data", (data) => {
	let lines = data.toString().split(/\r\n/);
	if (lines[lines.length - 1] === "") {
		lines = lines.slice(0, lines.length - 1);
	}
	lines.forEach((line) => {
		console.log(`Raw Received: ${line}`);
		if (data.startsWith("PING")) {
			console.log("Raw sending: PONG");
			client.write("PONG\r\n")
		}
	});
});

client.write(`NICK ${username}\r\n`);
client.write(`USER ${username} localhost * :Real name of user\r\n`);

rl.on("line", (line) => {
	console.log(`Raw sending: ${line}`);
	client.write(`${line}\r\n`);
});
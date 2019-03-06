const net = require("net");
const client = net.connect({
	host: "localhost",
	port: "6667"
});
const readline = require("readline");
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const username = process.argv.length > 2 ? process.argv[2] : "test";
const logger = require("../src/utils/logger")();
client.setEncoding("utf8");

client.on("data", (data) => {
	let lines = data.toString().split(/\r\n/);
	if (lines[lines.length - 1] === "") {
		lines = lines.slice(0, lines.length - 1);
	}
	lines.forEach((line) => {
		logger.info(`Raw Received: ${line}`);
		if (data.startsWith("PING")) {
			logger.info("Raw sending: PONG");
			client.write("PONG\r\n")
		}
	});
});

client.write(`NICK ${username}\r\n`);
client.write(`USER ${username} localhost * :Real name of user\r\n`);

rl.on("line", (line) => {
	logger.info(`Raw sending: ${line}`);
	client.write(`${line}\r\n`);
});
const commands = require("./commands");
const timeout = require("./utils/timeout");
const Message = require("./models/message");

module.exports = class ClientManager {

	constructor(client) {
		const that = this;
		that.client = client;
		client.buffer = "";
		console.log("Client connected");
		timeout.runTimeout(that);

		client.on("data", function (data) {
			const lines = data.toString().split(/[\n\r]/);
			let i, line;

			for (i = 0; i < lines.length - 1; i += 1) {
				line = client.buffer + lines[i];
				client.buffer = "";
				client.emit("message", line);
			}

			client.buffer += lines[lines.length - 1];
		});

		client.on("message", (data) => {
			console.log(`Raw received: ${data}`);
			const message = Message.fromMessageString(that.client.user ? that.client.user.nick : null, data);

			commands.forEach((command) => {
				if (command.test(message.command.toUpperCase())) {
					command.run(that, ...message.parameters)
				}
			});
		});
	}

	send(message) {
		console.log(`Raw sending: ${message.getMessageString()}`);
		try {
			this.client.write(`${message.getMessageString()}\r\n`);
		} catch (e) {
			console.log("Error, no connection anymore");
		}
	}

	disconnected() {
		console.log(`User ${this.user ? this.user.username : "unknown"} disconnected`);
		timeout.clearInterval();
		this.connected = false;
	}

};

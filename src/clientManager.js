const commands = require("./commands");
const timeout = require("./utils/timeout");

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
			console.log(`Raw message: ${data}`);
			const elements = data.split(" ");
			const prefix = elements[0].indexOf(":") === 0 ? elements[0] : null;
			const commandName = prefix ? elements[1] : elements[0];

			commands.forEach((command) => {
				if (command.test(commandName.toUpperCase())) {
					// TODO: support `:` param

					// TODO: strip out source (and then support later)

					// TODO: strip out tags (and then support later)
					command.run(that, ...elements.splice(prefix ? 2 : 1))
				}
			});
		});
	}

	send(message) {
		console.log(`Raw: sending ${message.getMessageString()}`);
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

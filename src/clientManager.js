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
			let lines = data.toString().split(/\r\n/);
			if (lines[lines.length - 1] === "") {
				lines = lines.slice(0, lines.length - 1);
			}
			let i;

			for (i = 0; i < lines.length; i += 1) {
				const line = lines[i];
				client.buffer = "";
				client.emit("message", line);
			}

			client.buffer += lines[lines.length - 1];
		});

		client.on("message", (data) => {
			console.log(`Raw received: ${data}`);
			const message = Message.fromMessageString(that.client.user ? that.client.user.nick : null, data);

			if (!message.command) {
				return console.log("Error");
			}

			let commandRun = false;
			commands.forEach((command) => {
				if (command.test(message.command.toUpperCase())) {
					commandRun = true;
					command.run(that, ...message.parameters);
				}
			});
			if (!commandRun) {
				that.send(Message.makeNumeric(Message.Command.ERR_UNKNOWNCOMMAND, message.command.toUpperCase(), that.getUserNick()));
			}
		});
	}

	getUserNick() {
		if (this.client && this.client.user && this.client.user.nick) {
			return this.client.user.nick;
		}

		return "";
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

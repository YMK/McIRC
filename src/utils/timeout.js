const Message = require("../models/message");
let interval;

module.exports = {
	waitingForResponse: false,
	timeoutTime: 30 * 1000,
	runTimeout: function (client) {
		interval = setInterval(() => {
			if (this.waitingForResponse) {
				clearInterval(interval);
				console.log("Error: Ping timeout");
			} else {
				this.waitingForResponse = true;
				client.send(Message.Builder()
					.withCommand(Message.Command.PING)
					.withParameter("localhost")
					.build());
			}
		}, this.timeoutTime);
	},
	receivedPong: function () {
		this.waitingForResponse = false;
	},
	clearInterval: function () {
		clearInterval(interval);
	}
};

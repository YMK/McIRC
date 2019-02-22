const Message = require("../models/message");
const logger = require("../utils/logger");
const intervals = {};

module.exports = {
	waitingForResponse: false,
	timeoutTime: 30 * 1000,
	runTimeout: function (client) {
		intervals[client.user.username] = setInterval(() => {
			if (this.waitingForResponse) {
				client.disconnected();
				logger.error("Error: Ping timeout");
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
	clearInterval: function (username) {
		clearInterval(intervals[username]);
	}
};

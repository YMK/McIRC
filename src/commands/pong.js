const Message = require("../models/message");
const timeout = require("../utils/timeout");

module.exports = {
	test: (command) => command === Message.Command.PONG,
	run: () => {
		timeout.clearTimeout();
	}
};

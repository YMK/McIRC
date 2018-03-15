const messages = require("../enums/messages");
const timeout = require("../utils/timeout");

module.exports = {
	test: (command) => command === messages.PONG,
	run: () => {
		timeout.clearTimeout();
	}
};

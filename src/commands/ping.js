const Message = require("../models/message");

module.exports = {
	test: (command) => command === Message.Command.PING,
	run: function (client) {
		// TODO: Add support for sending pings to other servers (multi server support, #94)
		client.send(Message.Builder()
			.withCommand(Message.Command.PONG)
			.build());
	}
};

const Message = require("../models/message");

module.exports = {
	test: (command) => command === Message.Command.PING,
	run: function (client, {args: [clientName]}) {
		client.send(Message.Builder()
			.withCommand(Message.Command.PONG)
			.withParameter(clientName)
			.build());
	}
};

const Message = require("../models/message");

module.exports = {
	test: (command) => command === Message.Command.VERSION,
	run: (client) => {
		// TODO: multi server support

		client.send(Message.makeISupport(client.user.nick));
		client.send(Message.makeVersion(client.user.nick));
	}
};

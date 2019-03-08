const Message = require("../models/message");
const {config} = require("../configManager");

module.exports = {
	test: (command) => command === Message.Command.TIME,
	run: (client) => {
		// TODO: Support other servers (ERR_NOSUCHSERVER)

		const time = (new Date()).toISOString();
		client.send(Message.makeNumeric(Message.Command.RPL_TIME, config.serverName, client.user.nick, ` ${time}`)); // TODO: Fix issue where the trailing on numeric isn't given ":" if it doesn't include a space
	}
};

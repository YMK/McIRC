const Message = require("../models/message");
const state = require("../../src/state");

module.exports = {
	test: (command) => command === Message.Command.MOTD,
	run: (client) => {
		// TODO: Support other servers (ERR_NOSUCHSERVER)


		// If no MOTD, ERR_NOMOTD
		if (!state.motd) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOMOTD, undefined, client.user.nick));
		}


		client.send(Message.makeNumeric(Message.Command.RPL_MOTDSTART, undefined, client.user.nick));

		state.motd
			.split("\n")
			.forEach((line) => line && client.send(Message.makeNumeric(Message.Command.RPL_MOTD, undefined, client.user.nick, line)));

		client.send(Message.makeNumeric(Message.Command.RPL_ENDOFMOTD, undefined, client.user.nick));

		// If MOTD, send RPL_MOTDSTART, RPL_MOTD, RPL_ENDOFMOTD
	}
};

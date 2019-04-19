const Message = require("../models/message");
const packageJson = require("../../package.json");

module.exports = {
	test: (command) => command === Message.Command.ADMIN,
	run: (client) => {
		// TODO: Support other servers (ERR_NOSUCHSERVER)

		client.send(Message.makeNumeric(Message.Command.RPL_INFO, [], client.user.nick, `This server runs on McIRC, version ${packageJson.version}`));
		client.send(Message.makeNumeric(Message.Command.RPL_INFO, [], client.user.nick, "McIRC was written by Al McKinlay (McInkay) <mcirc@10people.co.uk>"));
		client.send(Message.makeNumeric(Message.Command.RPL_INFO, [], client.user.nick, "To report any bugs, please go to https://github.com/McInkay/McIRC"));

		client.send(Message.makeNumeric(Message.Command.RPL_ENDOFINFO, [], client.user.nick));
	}
};

const Message = require("../models/message");
const {config} = require("../configManager");

module.exports = {
	test: (command) => command === Message.Command.ADMIN,
	run: (client) => {
		// TODO: Support other servers (ERR_NOSUCHSERVER)

		client.send(Message.makeNumeric(Message.Command.RPL_ADMINME, config.serverName, client.user.nick));
		client.send(Message.makeNumeric(Message.Command.RPL_ADMINLOC1, undefined, client.user.nick, config.admin.location));
		client.send(Message.makeNumeric(Message.Command.RPL_ADMINLOC2, undefined, client.user.nick, config.admin.owner));
		client.send(Message.makeNumeric(Message.Command.RPL_ADMINEMAIL, undefined, client.user.nick, config.admin.email));
	}
};

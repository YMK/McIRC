const Message = require("../models/message");

module.exports = {
	test: (command) => command === Message.Command.AWAY,
	run: function (client, {args: [reason]}) {
		if (reason) {
			client.user.setAway(reason);
			client.send(Message.makeNumeric(Message.Command.RPL_NOWAWAY, undefined, client.user.nick));
		} else {
			client.user.setUnAway();
			client.send(Message.makeNumeric(Message.Command.RPL_UNAWAY, undefined, client.user.nick));
		}
	}
};

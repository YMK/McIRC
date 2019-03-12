const Message = require("../models/message");
const state = require("../state");
const logger = require("../utils/logger")();

module.exports = {
	test: (command) => command === Message.Command.PRIVMSG || command === Message.Command.NOTICE,
	run: function (client, {args: [recipientList, ...messageParts], command}) {
		if (!recipientList) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NORECIPIENT, undefined, client.user.nick));
		}

		let message = messageParts.join(" ");
		if (!message) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOTEXTTOSEND, undefined, client.user.nick));
		}

		if (message.indexOf(":") === 0) {
			message = message.slice(1);
		}

		recipientList.split(",").forEach((recipient) => {

			const to = state.get(recipient);
			if (!to) {
				return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHNICK, to, client.user.nick));
			}

			logger.debug(`${command} to ${recipient} with ${message}`);
			if (command === Message.Command.PRIVMSG) {
				to.sendMessage(client.user.nick, message);
			} else if (command === Message.Command.NOTICE) {
				to.sendNotice(client.user.nick, message);
			}

		});
	}
};

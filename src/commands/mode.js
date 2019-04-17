const Message = require("../models/message");
const state = require("../state");
const {config} = require("../configManager");
const {knownModes} = require("../models/user");

module.exports = {
	test: (command) => command === Message.Command.MODE,
	run: (client, {args: [targetName, modestring]}) => {

		if (!targetName || targetName === "") {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.MODE, client.user.nick));
		}

		const isChannel = config.chanTypes.split("").some((type) => targetName.startsWith(type));

		const target = isChannel ? state.channels[targetName] : state.users[targetName];

		if (!target) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHNICK, [targetName], client.user.nick));
			// TODO: ERR_NOSUCHCHANNEL if target is channel
		}

		if (!isChannel && client.user.nick !== targetName) {
			return client.send(Message.makeNumeric(Message.Command.ERR_USERSDONTMATCH, undefined, client.user.nick));
		}

		if (!modestring) {
			return client.send(Message.makeNumeric(Message.Command.RPL_UMODEIS, [target.getModes().join("")], client.user.nick));
			// TODO: RPL_CHANNELMODEIS if target is channel
		}

		if (isChannel) {

			/*
			 * ERR_CHANOPRIVSNEEDED if user doesn't have channel privileges
			 * Apply modes to channel
			 */

		} else {

			const add = modestring.startsWith("+");
			const modes = modestring.slice(1).split("");
			let successModeString = add ? "+" : "-";

			modes.forEach((mode) => {
				let success = false;
				if (add) {
					success = target.setMode(mode)
				} else {
					success = target.unsetMode(mode);
				}

				if (success) {
					successModeString += mode;
				}

				if (!knownModes[mode]) {
					client.send(Message.makeNumeric(Message.Command.ERR_UMODEUNKNOWNFLAG, undefined, client.user.nick));
				}
			});


			client.send(Message.Builder()
				.withCommand(Message.Command.MODE)
				.withParameter(targetName)
				.withParameter(successModeString)
				.build());
		}

	}
};

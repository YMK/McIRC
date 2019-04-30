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
			const error = isChannel ? Message.Command.ERR_NOSUCHCHANNEL : Message.Command.ERR_NOSUCHNICK;
			return client.send(Message.makeNumeric(error, [targetName], client.user.nick));
		}

		if (!isChannel && client.user.nick !== targetName) {
			return client.send(Message.makeNumeric(Message.Command.ERR_USERSDONTMATCH, undefined, client.user.nick));
		}

		if (!modestring) {
			const rpl = isChannel ? Message.Command.RPL_CHANNELMODEIS : Message.Command.RPL_UMODEIS;
			const args = [target.getModes().join("")];
			if (isChannel) {
				args.unshift(targetName);
			}
			return client.send(Message.makeNumeric(rpl, args, client.user.nick));
		}

		if (isChannel) {
			const isOp = true;

			if (!isOp) {
				return client.send(Message.makeNumeric(Message.Command.ERR_CHANOPRIVSNEEDED, [targetName], client.user.nick));
			}

			/*
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

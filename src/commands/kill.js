const Message = require("../models/message");
const state = require("../../src/state");

module.exports = {
	test: (command) => command === Message.Command.QUIT,
	run: function (client, {args: [targetName, reason = "Unknown reason"]}) {

		if (!targetName || targetName === "") {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.KILL, client.user.nick));
		}

		if (!client.user.isOp()) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOPRIVS, "kill", client.user.nick));
		}

		const target = state.users[targetName];

		if (!target) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHNICK, [targetName], client.user.nick));
		}

		const killReason = `Killed (${client.user.nick} (${reason}))`

		const killMessage = Message.Builder()
			.withSource(client.user.getHostMask())
			.withCommand(Message.Command.KILL)
			.withParameter(target.username)
			.withParameter(reason)
			.build();

		target.client.send(killMessage);

		const quitMessage = Message.Builder()
			.withSource(target.getHostMask())
			.withCommand(Message.Command.QUIT)
			.withParameter(killReason)
			.build();

		target.getChannels().forEach((chan) => {
			chan.removeUser(target);
			chan.sendMessage(target.username, quitMessage);
		});

		const errorMessage = Message.Builder()
			.withCommand(Message.Command.ERROR)
			.withParameter(killReason)
			.build();

		target.client.send(errorMessage);
	}
};

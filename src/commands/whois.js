const Message = require("../models/message");
const state = require("../state");
const {config} = require("../configManager");

module.exports = {
	test: (command) => command === Message.Command.WHOIS,
	run: function (client, {args: [arg1, arg2]} = {args: []}) {
		let userName;
		if (arg2) {
			userName = arg2;
			// TODO: add support for server (server = arg1;)
		} else if (arg1) {
			userName = arg1;
		} else {
			client.send(Message.makeNumeric(Message.Command.ERR_NONICKNAMEGIVEN, null, client.getUserNick()));
		}
		// TODO: multi server support (inc ERR_NOSUCHSERVER)

		const user = state.users[userName];
		if (!user) {
			client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHNICK, [userName], client.getUserNick()));
		}

		let channels = user.getChannels()
			// TODO: Filter secret channels
			.map((chan) => chan.name);
		// TODO: Add prefixes to channels

		if (user.isInvisible()) {
			channels = channels.filter((chanName) => client.user.getChannels().some((chan) => chan.name === chanName));
		}

		client.send(Message.makeNumeric(
			Message.Command.RPL_WHOISUSER,
			[user.nick, user.username, user.hostname, "*"],
			client.getUserNick(),
			user.realname
		));
		client.send(Message.makeNumeric(Message.Command.RPL_WHOISCHANNELS, [user.nick], client.getUserNick(), channels.join(" ")));
		client.send(Message.makeNumeric(
			Message.Command.RPL_WHOISSERVER,
			[user.nick, config.serverName],
			client.getUserNick(),
			config.serverInfo
		));

		// TODO: RPL_WHOISOPERATOR

		// TODO: RPL_WHOISIDLE

		// TODO: RPL_AWAY

		client.send(Message.makeNumeric(Message.Command.RPL_ENDOFWHOIS, [user.nick], client.getUserNick()));
	}
};

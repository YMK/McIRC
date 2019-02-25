const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.WHOIS,
	run: (client, arg1, arg2) => {
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

		const chanlist = user.getChannels().map((chan) => chan.name).join(" "); // TODO: Filter secret channels and invisible user mode
		// TODO: Add prefixes to channels

		client.send(Message.makeNumeric(
			Message.Command.RPL_WHOISUSER,
			[user.nick, user.username, user.hostname, "*"],
			client.getUserNick(),
			user.realname
		));
		client.send(Message.makeNumeric(Message.Command.RPL_WHOISCHANNELS, [user.nick], client.getUserNick(), chanlist));
		client.send(Message.makeNumeric(
			Message.Command.RPL_WHOISSERVER,
			[user.nick, "servername"], // TODO: Get from config
			client.getUserNick(),
			"Server info" // TODO: Get from config
		));

		// TODO: RPL_WHOISOPERATOR

		// TODO: RPL_WHOISIDLE

		// TODO: RPL_AWAY

		client.send(Message.makeNumeric(Message.Command.RPL_ENDOFWHOIS, [user.nick], client.getUserNick()));
	}
};

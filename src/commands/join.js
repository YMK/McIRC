// <channel>{,<channel>} [<key>{,<key>}]

const Message = require("../models/message");
const Channel = require("../models/channel");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.JOIN,
	run: (client, chanlist) => {

		// TODO: Support keys (ERR_BADCHANNELKEY)

		if (!chanlist) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.JOIN, client.user.nick));
		}

		chanlist.split(",").forEach((chanName) => {

			let channel = state.channels[chanName];
			if (!channel) {
				channel = new Channel(chanName, client.user);
				state.addChannel(channel);
			} else if (!channel.getUsers().includes(client.user)) {
				channel.addUser(client.user);
			}
			client.user.addChannel(channel);
			const joinMessage = Message.Builder()
				.withSource(client.user.nick)
				.withCommand(Message.Command.JOIN)
				.withParameter(chanName)
				.build();
			client.send(joinMessage);

			if (channel.topic) {
				client.send(Message.Builder()
					.withCommand(Message.Command.RPL_TOPIC)
					.withParameter(client.user.nick)
					.withParameter(channel.name)
					.withParameter(channel.topic.text)
					.build());
			} else {
				client.send(Message.makeNumeric(Message.Command.RPL_NOTOPIC, chanName, client.user.nick));
			}

			// TODO: Send names
			const namelist = channel.getUsers().reduce((total, user) => `${total + user.nick} `, "");
			client.send(Message.Builder()
				.withCommand(Message.Command.RPL_NAMREPLY)
				.withParameter(client.user.nick)
				.withParameter("=")
				.withParameter(channel.name)
				.withParameter(namelist)
				.build());
			client.send(Message.Builder()
				.withCommand(Message.Command.RPL_ENDOFNAMES)
				.withParameter(client.user.nick)
				.withParameter(channel.name)
				.withParameter("End of /NAMES list")
				.build());
			channel.sendMessage(client.user.nick, joinMessage);
		});
	}
};

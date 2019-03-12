// <channel>{,<channel>} [<key>{,<key>}]

const Message = require("../models/message");
const Channel = require("../models/channel");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.JOIN,
	run: function (client, {args: [chanlist, keys]}) {

		if (!chanlist) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.JOIN, client.user.nick));
		}

		const keylist = keys ? keys.split(",") : []; // This is the list of keys. Could be empty, otherwise could be up to chanlist.size

		chanlist.split(",").forEach((chanName, index) => {

			let channel = state.channels[chanName];
			if (!channel) {
				channel = new Channel(chanName, client.user);
				state.addChannel(channel);
			} else if (!channel.getUsers().includes(client.user)) {
				if (channel.key) {
					if (index >= keylist.length) {
						return client.send(Message.makeNumeric(Message.Command.ERR_BADCHANNELKEY, channel.name, client.user.nick));
					} else if (keylist[index] !== channel.key) {
						// We have provided the wrong key
						return client.send(Message.makeNumeric(Message.Command.ERR_BADCHANNELKEY, channel.name, client.user.nick));
					}
				}

				// TODO: Bans

				// TODO: Invite only

				// TODO: Channel limit mode

				channel.addUser(client.user);
			}
			client.user.addChannel(channel);
			const joinMessage = Message.Builder()
				.withSource(client.user.getHostMask())
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
			}

			channel.getUsers()
				.forEach((user) => client.send(Message.Builder()
					.withCommand(Message.Command.RPL_NAMREPLY)
					.withParameter(client.user.nick)
					.withParameter("=")
					.withParameter(channel.name)
					.withParameter(user.nick)
					.build()));

			client.send(Message.makeNumeric(Message.Command.RPL_ENDOFNAMES, chanName, client.user.nick));

			channel.sendMessage(client.user.nick, joinMessage);
		});
	}
};

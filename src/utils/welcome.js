const Message = require("../models/message");
const {config} = require("../configManager");
const {version} = require("../../package.json");

const WELCOME = "Welcome to the Internet Relay Network";
const YOUR_HOST = "Your host is localhost, running version";
const CREATED = "This server was created";

module.exports = (client) => {
	client.send(Message.Builder()
		.withCommand(Message.Command.RPL_WELCOME)
		.withParameter(client.user.nick)
		.withParameter(`${WELCOME} ${client.user.nick}!${client.user.username}@${client.user.hostname}`)
		.build());
	client.send(Message.Builder()
		.withCommand(Message.Command.RPL_YOURHOST)
		.withParameter(client.user.nick)
		.withParameter(`${YOUR_HOST} ${version}`)
		.build());
	client.send(Message.Builder()
		.withCommand(Message.Command.RPL_CREATED)
		.withParameter(client.user.nick)
		.withParameter(`${CREATED} ${(new Date()).toISOString()}`) // TODO: Time that the server was started
		.build());
	client.send(Message.Builder()
		.withCommand(Message.Command.RPL_MYINFO)
		.withParameter(client.user.nick)
		.withParameter(config.serverName)
		.withParameter(version)
		.withParameter("o")
		.withParameter("o")
		.build());

	client.send(Message.makeISupport(client.user.nick));
};
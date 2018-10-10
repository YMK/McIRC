class Message {

	constructor(name, parameters, source) {
		this.command = name;
		this.source = source;
		// TODO: Limit to 15

		// TODO: Error if we have spaces in anything other than the last (and prepend it with ":" if we do)
		this.parameters = parameters || [];
		this.parameters = this.parameters.map((parameter, index) => {
			if (parameter.includes(" ") && index === this.parameters.length - 1) {
				return `:${parameter}`;
			} else if (parameter.includes(" ")) {
				throw new Error("Only final parameter can include spaces");
			} else {
				return parameter;
			}
		});
	}

	getMessageString() {
		// [@tags] [:source] <command> <parameters>

		// TODO: add tags
		let string = "";
		if (this.source) {
			string += `:${this.source} `
		}
		string += `${this.command} ${this.parameters.join(" ")}`.trim();

		return string;
	}

	static makeISupport(username) {
		/* eslint-disable multiline-comment-style */
		return Message.Builder()
			.withCommand(Message.Command.RPL_ISUPPORT)
			.withParameter(username)
			// TODO: Add AWALEN=200 (for AWAY message length) **REQUIRED**
			.withParameter("CASEMAPPING=ascii")
			.withParameter("CHANLIMIT=#:")
			// TODO: Add CHANMODES=ASDSDGFW (for channel modes) **REQUIRED**
			.withParameter("CHANNELLEN=100") // TODO: add this to config
			.withParameter("CHANTYPES=#")
			// TODO: Add ELIST= (for LIST search) **REQUIRED**
			// TODO: Add EXCEPTS=e (for ban exceptions)
			// TODO: Add EXTBAN= (for extended ban masks)
			.withParameter("HOSTLEN=100") // TODO: add this to config
			// TODO: Add KICKLEN=255 (for kick reason lengths) **REQUIRED**
			// TODO: Add MAXLIST= (for something to do with modes) **REQUIRED**
			.withParameter("NETWORK=McIRC") // TODO: Add this to config
			.withParameter("NICKLEN=31") // TODO: Add this to config
			// TODO: Add PREFX= (for user prefixes on channels)
			// TODO: Maybe add SAFELIST if necessary? Maybe make it configurable
			// TODO: Add SILENCE
			// TODO: Add STATUSMSG= (for supporting sending messages to a prefix on a channel) **REQUIRED**
			// TODO: Add TOPICLEN=390 (for max topic length) **REQUIRED**
			.withParameter("USERLEN=31") // TODO: Add this to config
			.withParameter(":are supported by this server")
			.build();
		/* eslint-enable */
	}

	static makeVersion(username) {
		return Message.Builder()
			.withCommand(this.Command.RPL_VERSION)
			.withParameter(username)
			.withParameter("McIRC-0.0.1")
			.withParameter("server-name")
			.build();
	}

	static makeNumeric(numeric, command, username) {
		const message = this.NumericMessage[numeric];
		const params = [username];
		if (command) {
			params.push(command);
		}
		params.push(message)

		return new Message(numeric, params);
	}

	static Builder() {
		return new class Builder {
			// TODO: fromString(commandstring) {

			withCommand(command) {
				this.command = command;

				return this;
			}

			withSource(source) {
				this.source = source;

				return this;
			}

			withParameter(parameter) {
				this.parameters = this.parameters || [];
				if (parameter.includes(" ")) {
					this.parameters.push(`:${parameter}`);
				} else {
					this.parameters.push(parameter);
				}

				return this;
			}

			build() {
				return new Message(this.command, this.parameters, this.source);
			}
		}()
	}
}

Message.Command = {
	// Messages
	JOIN: "JOIN",
	NICK: "NICK",
	PART: "PART",
	PING: "PING",
	PONG: "PONG",
	PRIVMSG: "PRIVMSG",
	QUIT: "QUIT",
	USER: "USER",
	VERSION: "VERSION",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004",
	RPL_ISUPPORT: "005",
	RPL_VERSION: "351",
	RPL_NAMREPLY: "353",
	RPL_ENDOFNAMES: "366",

	ERR_NOSUCHNICK: "401",
	ERR_NOSUCHCHANNEL: "403",
	ERR_NORECIPIENT: "411",
	ERR_NOTEXTTOSEND: "412",
	ERR_NONICKNAMEGIVEN: "431",
	ERR_NICKNAMEINUSE: "433",
	ERR_NOTONCHANNEL: "442",
	ERR_NEEDMOREPARAMS: "461",
};

Message.NumericMessage = {
	[Message.Command.ERR_NOSUCHNICK]: "No such nick/channel",
	[Message.Command.ERR_NOSUCHCHANNEL]: "No such channel",
	[Message.Command.ERR_NORECIPIENT]: "No recipient given",
	[Message.Command.ERR_NOTEXTTOSEND]: "No text to send",
	[Message.Command.ERR_NONICKNAMEGIVEN]: "No nickname given",
	[Message.Command.ERR_NICKNAMEINUSE]: "Nickname is already in use",
	[Message.Command.ERR_NOTONCHANNEL]: "You're not on that channel",
	[Message.Command.ERR_NEEDMOREPARAMS]: "Not enough parameters",
}

module.exports = Message;
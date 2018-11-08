class Message {

	constructor(name, parameters, source) {
		this.command = name;
		this.source = source;
		// TODO: Limit to 15

		this.parameters = parameters || [];
		this.parameters
			.map((parameter) => parameter || "")
			.forEach((parameter, index) => {
			if (parameter.includes(" ") && index !== this.parameters.length - 1) {
				throw new Error("Only final parameter can include spaces");
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
		string += this.command;
		const lastParam = this.parameters[this.parameters.length - 1];
		if (lastParam) {
			const lastParamString = lastParam.includes(" ") ? `:${lastParam}` : lastParam;
			if (this.parameters.length > 1) {
				const paramString = `${this.parameters.slice(0, -1).join(" ")} ${lastParamString}`;
				string += ` ${paramString}`;
			} else {
				string += ` ${lastParamString}`;
			}
		}

		return string.trim();
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

	static fromMessageString(user, string) {
		const elements = string.split(" ");

		const tagString = elements[0].indexOf("@") === 0 ? elements[0] : null;
		const maybeSource = tagString && elements.length > 1 ? elements[1] : elements[0];
		const source = maybeSource.indexOf(":") === 0 ? maybeSource.slice(1) : null;
		const numberPreCommand = Number(Boolean(source)) + Number(Boolean(tagString));
		const commandName = elements[numberPreCommand];
		const params = elements.slice(numberPreCommand + 1);
		const parameters = [];
		for (let index = 0; index < params.length; index++) {
			const param = params[index];
			if (param.includes(":")) {
				parameters.push(`${param.slice(1)} ${params.slice(index + 1).join(" ")}`);
				break;
			} else {
				parameters.push(param);
			}
		}

		return new Message(commandName, parameters, source || user);
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
				this.parameters.push(parameter);

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
	TOPIC: "TOPIC",
	USER: "USER",
	VERSION: "VERSION",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004",
	RPL_ISUPPORT: "005",
	RPL_NOTOPIC: "331",
	RPL_TOPIC: "332",
	RPL_TOPICWHOTIME: "333",
	RPL_VERSION: "351",
	RPL_NAMREPLY: "353",
	RPL_ENDOFNAMES: "366",

	ERR_NOSUCHNICK: "401",
	ERR_NOSUCHCHANNEL: "403",
	ERR_NORECIPIENT: "411",
	ERR_NOTEXTTOSEND: "412",
	ERR_UNKNOWNCOMMAND: "421",
	ERR_NONICKNAMEGIVEN: "431",
	ERR_NICKNAMEINUSE: "433",
	ERR_NOTONCHANNEL: "442",
	ERR_NEEDMOREPARAMS: "461",
};

Message.NumericMessage = {
	[Message.Command.RPL_NOTOPIC]: "No topic is set",
	[Message.Command.ERR_NOSUCHNICK]: "No such nick/channel",
	[Message.Command.ERR_NOSUCHCHANNEL]: "No such channel",
	[Message.Command.ERR_NORECIPIENT]: "No recipient given",
	[Message.Command.ERR_NOTEXTTOSEND]: "No text to send",
	[Message.Command.ERR_UNKNOWNCOMMAND]: "Unknown command",
	[Message.Command.ERR_NONICKNAMEGIVEN]: "No nickname given",
	[Message.Command.ERR_NICKNAMEINUSE]: "Nickname is already in use",
	[Message.Command.ERR_NOTONCHANNEL]: "You're not on that channel",
	[Message.Command.ERR_NEEDMOREPARAMS]: "Not enough parameters",
}

module.exports = Message;
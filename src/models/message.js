const {format, parse} = require("tekko");
const {config} = require("../configManager");

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

		let params = this.parameters;
		let lastParam;
		if (params && params.length > 0 && params[params.length - 1] && params[params.length - 1].includes(" ")) {
			lastParam = params[params.length - 1];
			params = params.slice(0, -1);
		}

		const formatParams = {
			command: this.command,
			params: params,
			trailing: lastParam
		};

		if (this.source) {
			formatParams.prefix = {name: this.source};
		}

		return format(formatParams);
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
			.withParameter(`CHANNELLEN=${config.channelLength}`)
			.withParameter("CHANTYPES=#")
			// TODO: Add ELIST= (for LIST search) **REQUIRED**
			// TODO: Add EXCEPTS=e (for ban exceptions)
			// TODO: Add EXTBAN= (for extended ban masks)
			.withParameter(`HOSTLEN=${config.hostLength}`)
			// TODO: Add KICKLEN=255 (for kick reason lengths) **REQUIRED**
			// TODO: Add MAXLIST= (for something to do with modes) **REQUIRED**
			.withParameter(`NETWORK=${config.network}`)
			.withParameter(`NICKLEN=${config.nickLength}`)
			// TODO: Add PREFX= (for user prefixes on channels)
			// TODO: Maybe add SAFELIST if necessary? Maybe make it configurable
			// TODO: Add SILENCE
			// TODO: Add STATUSMSG= (for supporting sending messages to a prefix on a channel) **REQUIRED**
			// TODO: Add TOPICLEN=390 (for max topic length) **REQUIRED**
			.withParameter(`USERLEN=${config.userLength}`)
			.withParameter("are supported by this server")
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

	static makeNumeric(numeric, customParams, user, customMessage) {
		const message = customMessage || this.NumericMessage[numeric];
		let params = [user];
		if (customParams && Array.isArray(customParams)) {
			params = params.concat(customParams);
		} else if (customParams) {
			params.push(customParams);
		}
		params.push(message);

		return new Message(numeric, params);
	}

	static fromMessageString(user, string) {
		const parsed = parse(string);
		const source = parsed.prefix && parsed.prefix.name ? parsed.prefix.name : user;

		return new Message(parsed.command, parsed.params.concat(parsed.trailing), source);
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
	NAMES: "NAMES",
	NICK: "NICK",
	PART: "PART",
	PING: "PING",
	PONG: "PONG",
	PRIVMSG: "PRIVMSG",
	QUIT: "QUIT",
	TOPIC: "TOPIC",
	USER: "USER",
	VERSION: "VERSION",
	WHOIS: "WHOIS",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004",
	RPL_ISUPPORT: "005",
	RPL_WHOISUSER: "311",
	RPL_WHOISSERVER: "312",
	RPL_WHOISOPERATOR: "313",
	RPL_WHOISIDLE: "317",
	RPL_ENDOFWHOIS: "318",
	RPL_WHOISCHANNELS: "319",
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
	ERR_BADCHANNELKEY: "475"
};

Message.NumericMessage = {
	[Message.Command.RPL_ENDOFWHOIS]: "End of /WHOIS list",
	[Message.Command.RPL_NOTOPIC]: "No topic is set",
	[Message.Command.RPL_ENDOFNAMES]: "End of /NAMES list",
	[Message.Command.ERR_NOSUCHNICK]: "No such nick/channel",
	[Message.Command.ERR_NOSUCHCHANNEL]: "No such channel",
	[Message.Command.ERR_NORECIPIENT]: "No recipient given",
	[Message.Command.ERR_NOTEXTTOSEND]: "No text to send",
	[Message.Command.ERR_UNKNOWNCOMMAND]: "Unknown command",
	[Message.Command.ERR_NONICKNAMEGIVEN]: "No nickname given",
	[Message.Command.ERR_NICKNAMEINUSE]: "Nickname is already in use",
	[Message.Command.ERR_NOTONCHANNEL]: "You're not on that channel",
	[Message.Command.ERR_NEEDMOREPARAMS]: "Not enough parameters",
	[Message.Command.ERR_BADCHANNELKEY]: "Cannot join channel (+k)"
}

module.exports = Message;
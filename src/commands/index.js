const nick = require("./nick");
const pong = require("./pong");
const ping = require("./ping");
const privmsg = require("./privmsg");
const user = require("./user");

module.exports = [
	nick,
	ping,
	pong,
	privmsg,
	user,
];
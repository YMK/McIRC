class State {

	constructor() {
		this.users = {};
		this.channels = {};
	}

	addUser(user) {
		if (!user || !user.nick) {
			return;
		}
		this.users[user.nick] = user;
	}

	addChannel(channel) {
		if (!channel || !channel.name) {
			return;
		}
		this.channels[channel.name] = channel;
	}

	changeUserNick(oldNick, newNick) {
		this.users[newNick] = this.users[oldNick];
		delete this.users[oldNick];
	}

	get(nick) {
		return this.users[nick] || this.channels[nick];
	}
}

module.exports = new State();
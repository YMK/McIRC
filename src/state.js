class State {

	constructor() {
		this.users = {};
	}

	addUser(user) {
		if (!user || !user.nick) {
			return;
		}
		this.users[user.nick] = user;
	}

	changeUserNick(oldNick, newNick) {
		this.users[newNick] = this.users[oldNick];
		delete this.users[oldNick];
	}

	getUser(nick) {
		return this.users[nick];
	}
}

module.exports = new State();
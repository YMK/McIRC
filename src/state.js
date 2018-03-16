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

	getUser(nick) {
		return this.users[nick];
	}
}

module.exports = new State();
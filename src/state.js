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
}

module.exports = new State();
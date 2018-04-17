module.exports = class Channel {

	constructor(name, owner) {
		this.command = name;
		this.users = [owner];
		this.owner = owner;
		this.modes = [];
	}

	addUser(user) {
		this.users.push(user);
	}

	removeUser(user) {
		this.users.splice(this.users.indexOf(user), 1);
	}

};
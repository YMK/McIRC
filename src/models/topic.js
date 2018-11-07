module.exports = class Topic {

	constructor(text, author) {
		this.text = text;
		this.author = author;
		this.time = Math.round(Date.now() / 1000);
	}

	changeTopic(text, author) {
		this.text = text;
		this.author = author;
		this.time = Math.round(Date.now() / 1000);
	}

};
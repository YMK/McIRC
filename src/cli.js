const {addConfigFromFile} = require("./configManager");
const McIrc = require("./index");

addConfigFromFile();

const server = new McIrc();
server.start();
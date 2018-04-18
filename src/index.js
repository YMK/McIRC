const net = require("net");
const ClientManager = require("./clientManager");
require("./state");

const server = net.createServer((client) => new ClientManager(client));

server.listen(6667, "127.0.0.1");

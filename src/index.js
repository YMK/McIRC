const net = require("net");
const ClientManager = require("./clientManager");
require("./state");

const server = net.createServer((client) => {
    console.log("New connection, creating client");
    const clientManager = new ClientManager(client);
    client.on("error", (err) => {
        if (err.code === "ECONNRESET") {
            clientManager.disconnected();
        } else {
            console.log(err);
        }
    });
});

server.listen(6667, "127.0.0.1");

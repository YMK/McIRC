const logger = require("./utils/logger")({level: "debug"});

const net = require("net");
const ClientManager = require("./clientManager");
require("./state");

const server = net.createServer((client) => {
    logger.debug("New connection, creating client");
    const clientManager = new ClientManager(client);
    client.on("error", (err) => {
        if (err.code === "ECONNRESET") {
            clientManager.disconnected();
        } else {
            logger.error(err);
        }
    });
});

server.listen(6667, "127.0.0.1", () => logger.info("Server up and running"));

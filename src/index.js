
const net = require("net");

module.exports = class McIrc {

	constructor(customConfig) {
        const {config, addConfig} = require("./configManager");
        if (customConfig) {
            addConfig(config);
        }
        const logger = require("./utils/logger")({level: config.logLevel});
        const ClientManager = require("./clientManager");
        require("./state");

        this.config = config;
        this.logger = logger;
        this.server = net.createServer((client) => {
            logger.debug("New connection, creating client");
            const clientManager = new ClientManager(client);
            client.on("error", (err) => {
                if (err.code === "ECONNRESET") {
                    clientManager.disconnected("Connection reset");
                } else {
                    logger.error(err);
                }
            });
        });
    }

    start() {
        this.server.listen(6667, "127.0.0.1", () => this.logger.info("Server up and running"));
    }

    stop() {
        this.server.close();
    }

};

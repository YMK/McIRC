const {createLogger, format, transports} = require("winston");
const {printf} = format;

const myFormat = printf((info) => `[${info.level}]: ${info.message}`);

const logger = createLogger({
    format: myFormat,
    transports: [new transports.Console()],
    level: "info"
});

module.exports = logger;
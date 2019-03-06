const {createLogger, format, transports} = require("winston");
const {printf} = format;

const myFormat = printf((info) => `[${info.level}]: ${info.message}`);

let logger;

const create = ({level = "info"}) => {
    logger = createLogger({
        format: myFormat,
        transports: [new transports.Console()],
        level
    });

    return logger;
}

module.exports = ({level} = {}) => logger || create({level});
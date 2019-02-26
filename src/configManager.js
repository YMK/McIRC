
const defaultconfig = require("../config.default.json");
const CONFIG_FILE_NAME = "../config.json";
let config = {};
try {
    config = require(CONFIG_FILE_NAME);
} catch (e) {
    // Log error that there is no config and we'll just be using the default
}

const mergedConfig = {
    ...defaultconfig,
    ...config
};

module.exports = {
    config: mergedConfig
};

const defaultConfig = require("../config.default.json");
const CONFIG_FILE_NAME = "../config.json";
const config = {
    ...defaultConfig
}

const addConfigFromFile = () => {
    let fileConfig;
    try {
        fileConfig = require(CONFIG_FILE_NAME);
    } catch (e) {
        // Log error that there is no config and we'll just be using the default
    }
    Object.assign(config, fileConfig);
}

const addConfig = (newConfig) => {
    Object.assign(config, newConfig);
}

module.exports = {
    config,
    addConfigFromFile,
    addConfig
};
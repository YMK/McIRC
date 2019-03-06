let tested;

const importConfig = (mockDefaultConfig, mockConfig) => {
	// Clear require and jest cache
	jest.resetModules();

	// Mock config
	jest.mock("../config.default.json", () => mockDefaultConfig || {});
	jest.mock("../config.json", () => mockConfig || {}, {virtual: true});

	tested = require("../src/configManager");
};

test("Returns config object", () => {
	importConfig();
	expect(tested.config).not.toBeNull();
});

test("With no default or config, just returns changeConfig function", () => {
	importConfig();
	expect(tested.config).toEqual({});
});

test("Defaults to defaultConfig", () => {
	importConfig({test: "test"});
	expect(tested.config).toEqual({test: "test"});
});

test("Config file overrides defaultConfig", () => {
	importConfig({test: "test", test2: "test2"}, {test2: "NOPE"});
	tested.addConfigFromFile();
	expect(tested.config).toEqual({test: "test", test2: "NOPE"});
});

test("Adding override config overrides defaultConfig", () => {
	importConfig({test: "test", test2: "test2"});
	tested.addConfig({test2: "Overridden"});
	expect(tested.config).toEqual({test: "test", test2: "Overridden"});
});

test("Adding override config overrides file config", () => {
	importConfig({test: "test"}, {test2: "test2"});
	tested.addConfigFromFile();
	tested.addConfig({test2: "Overridden"});
	expect(tested.config).toEqual({test: "test", test2: "Overridden"});
});
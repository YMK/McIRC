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

test("Config overrides defaultConfig", () => {
	importConfig({test: "test", test2: "test2"}, {test2: "NOPE"});
	expect(tested.config).toEqual({test: "test", test2: "NOPE"});
});
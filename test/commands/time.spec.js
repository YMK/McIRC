const tested = require("../../src/commands/time");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, newUser;

beforeEach(() => {
    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);

    const constantDate = new Date("2019-02-13T06:41:20");

    /* eslint no-global-assign:off,no-native-reassign:off*/
    Date = class extends Date {
        constructor() {
            return constantDate
        }
    }
});

test("Sends RPL_TIME", () => {
    tested.run(new mockClient());

    const nomotdReply = mockSend.mock.calls[0][0].getMessageString();
    expect(nomotdReply).toBe("391 username mcirc.yamanickill.com : 2019-02-13T06:41:20.000Z");
});
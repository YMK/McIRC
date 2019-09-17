const tested = require("../../src/commands/mode");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let existingUser, mockClient, mockSend;

beforeEach(() => {
    existingUser = new user("existingUser", mockClient, "existingUser", "localhost", "", "");
    state.channels = {};
    state.users = {existingUser};
    mockSend = jest.fn();
    mockClient = utils.mockClient(existingUser, mockSend);
});


describe("User modes", () => {

    test("Sends ERR_NOSUCHNICK when there is no user", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["notAUser"]});

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("401 existingUser notAUser :No such nick/channel");
    });

    test("Sends ERR_USERSDONTMATCH when there is no user", () => {
        expect(state.users).toEqual({existingUser});
        const otherUser = new user("otherUser", mockClient, "otherUser", "localhost", "", "");
        state.users.otherUser = otherUser;
        tested.run(new mockClient(), {args: ["otherUser"]});

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("502 existingUser :Cant change mode for other users");
    });

    test("Sends RPL_UMODIS when no modestring sent", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["existingUser"]});

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("221 existingUser");
    });

    test("Sends RPL_UMODIS with modes when no modestring sent", () => {
        expect(state.users).toEqual({existingUser});
        existingUser.setMode("i");
        tested.run(new mockClient(), {args: ["existingUser"]});

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("221 existingUser i");
    });

    test("Sets mode when provided with modestring starting with +", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["existingUser", "+i"]});

        expect(state.users[existingUser.username].getModes()).toContain("i");

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("MODE existingUser +i");
    });

    test("Sets all supplied modse when provided with modestring starting with +", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["existingUser", "+iw"]});

        expect(state.users[existingUser.username].getModes()).toContain("i");
        expect(state.users[existingUser.username].getModes()).toContain("w");

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("MODE existingUser +iw");
    });

    test("Sends ERR_UMODEUNKNOWNFLAG when setting an unknown mode, but still sets that mode", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["existingUser", "+iz"]});

        expect(state.users[existingUser.username].getModes()).toContain("i");
        expect(state.users[existingUser.username].getModes()).toContain("z");

        const unknownReply = mockSend.mock.calls[0][0].getMessageString();
        expect(unknownReply).toBe("501 existingUser :Unknwon MODE flag");

        const reply = mockSend.mock.calls[1][0].getMessageString();
        expect(reply).toBe("MODE existingUser +iz");
    });

    test("Removes mode when provided with modestring starting with -", () => {
        expect(state.users).toEqual({existingUser});
        existingUser.setMode("i");
        tested.run(new mockClient(), {args: ["existingUser", "-i"]});

        expect(state.users[existingUser.username].getModes()).not.toContain("i");

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("MODE existingUser -i");
    });

    test("Removes all supplied modse when provided with modestring starting with -", () => {
        expect(state.users).toEqual({existingUser});
        existingUser.setMode("i");
        existingUser.setMode("w");
        tested.run(new mockClient(), {args: ["existingUser", "-iw"]});

        expect(state.users[existingUser.username].getModes()).not.toContain("i");
        expect(state.users[existingUser.username].getModes()).not.toContain("w");

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("MODE existingUser -iw");
    });

    test("Sends ERR_UMODEUNKNOWNFLAG when removing an unknown mode, but still unsets that mode", () => {
        expect(state.users).toEqual({existingUser});
        existingUser.setMode("i");
        existingUser.setMode("z");
        tested.run(new mockClient(), {args: ["existingUser", "-iz"]});

        expect(state.users[existingUser.username].getModes()).not.toContain("i");
        expect(state.users[existingUser.username].getModes()).not.toContain("z");

        const unknownReply = mockSend.mock.calls[0][0].getMessageString();
        expect(unknownReply).toBe("501 existingUser :Unknwon MODE flag");

        const reply = mockSend.mock.calls[1][0].getMessageString();
        expect(reply).toBe("MODE existingUser -iz");
    });

    test("Ignores when setting an op only mode", () => {
        expect(state.users).toEqual({existingUser});
        tested.run(new mockClient(), {args: ["existingUser", "+io"]});

        expect(state.users[existingUser.username].getModes()).toContain("i");
        expect(state.users[existingUser.username].getModes()).not.toContain("o");

        const reply = mockSend.mock.calls[0][0].getMessageString();
        expect(reply).toBe("MODE existingUser +i");
    });

});

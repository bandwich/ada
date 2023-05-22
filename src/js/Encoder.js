"use strict";
// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Actions ---------------------------------------------------

    Controllers are invoked by the controller change status byte (1011nnnn) followed by the controller number (0-127) followed
    by the controller value.
    
    Older conventions of switch values, such as any data value over 0 = 'ON,' or recognizing only 0 = 'OFF' and 127 = 'ON'
    and ignoring the rest, have been replaced by the convention 0-63 = 'ON' and 64-127 = 'OFF.'

    Data pipeline, top-down: Ada -> mode -> track selection -> transition (group of actions) -> action (midi signal)

    status byte (opcode + channel), controller number, controller value
    XML file matches on status and midino (controller number) - bytes 1 and 2
*/
var midi_1 = require("@julusian/midi");
var MidiOut = {
    cancelNudgeMasterGain: function () { return [0x80, 0, 0]; },
    cancelNudgeLevel: function (deck) { return [0x81, deck, 0]; },
    cancelNudgeHiEQ: function (deck) { return [0x82, deck, 0]; },
    cancelNudgeMidEQ: function (deck) { return [0x83, deck, 0]; },
    cancelNudgeLoEQ: function (deck) { return [0x84, deck, 0]; },
    cancelNudgeTempo: function (deck) { return [0x85, deck, 0]; },
    selectPlaylist: function (id) { return [0x90, 0, id]; },
    selectTrack: function (deck, pos) { return [0x91, deck, pos]; },
    adjustJumpSize: function (deck, size) { return [0x92, deck, size]; },
    jumpForward: function (deck, value) { return [0x93, deck, value]; },
    jumpBackward: function (deck, value) { return [0x94, deck, value]; },
    setTempo: function (deck, val) { return [0x95, deck, val]; },
    adjustLoopLength: function (deck, len) { return [0x96, deck, len]; },
    loop: function (deck, val) { return [0x97, deck, val]; },
    sync: function (deck, val) { return [0x98, deck, val]; },
    play: function (deck, val) { return [0x99, deck, val]; },
    mute: function (deck, val) { return [0x9a, deck, val]; },
    activateHotcue: function (deck, num) { return [0x9b, deck, num]; },
    nudgeMasterGain: function (size, direction) { return [0xb0, size, direction]; },
    // deck-dependent nudges use val to indicate both direction and size: parity = direction, size = size
    nudgeVolume: function (deck, val) { return [0xb1, deck, val]; },
    nudgeHiEQ: function (deck, val) { return [0xb2, deck, val]; },
    nudgeMidEQ: function (deck, val) { return [0xb3, deck, val]; },
    nudgeLoEQ: function (deck, val) { return [0xb4, deck, val]; },
    nudgeTempo: function (deck, val) { return [0xb5, deck, val]; },
    // add eq kill methods
};
var MidiIn = function (message) {
    switch (message[0]) {
    }
};
var setupConnections = function (input, output) {
    input.on('message', function (deltaTime, message) {
        MidiIn(message);
    });
    output.openPort(0);
};
var closePorts = function (input, output) {
    input.closePort();
    output.closePort();
};
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var vIn, vOut;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vIn = new midi_1.Input();
                vOut = new midi_1.Output();
                setupConnections(vIn, vOut);
                return [4 /*yield*/, tests(vOut)];
            case 1:
                _a.sent();
                closePorts(vIn, vOut);
                return [2 /*return*/];
        }
    });
}); };
var delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { setTimeout(resolve, ms); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var tests = function (output) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, delay(2000)];
            case 1:
                _a.sent();
                output.send(MidiOut.selectPlaylist(1));
                return [4 /*yield*/, delay(3000)];
            case 2:
                _a.sent();
                output.send(MidiOut.selectTrack(0, 14));
                return [4 /*yield*/, delay(2000)];
            case 3:
                _a.sent();
                output.send(MidiOut.play(0, 1));
                // await delay(3000)
                // output.send(MidiOut.nudgeMasterGain(0, 0))
                // await delay(2000)
                // output.send(MidiOut.cancelNudgeMasterGain())
                // await delay(3000)
                // output.send(MidiOut.nudgeMasterGain(0, 1))
                // await delay(2000)
                // output.send(MidiOut.cancelNudgeMasterGain())
                return [4 /*yield*/, delay(3000)];
            case 4:
                // await delay(3000)
                // output.send(MidiOut.nudgeMasterGain(0, 0))
                // await delay(2000)
                // output.send(MidiOut.cancelNudgeMasterGain())
                // await delay(3000)
                // output.send(MidiOut.nudgeMasterGain(0, 1))
                // await delay(2000)
                // output.send(MidiOut.cancelNudgeMasterGain())
                _a.sent();
                output.send(MidiOut.nudgeHiEQ(0, 2));
                return [4 /*yield*/, delay(1500)];
            case 5:
                _a.sent();
                output.send(MidiOut.nudgeHiEQ(0, 3));
                return [4 /*yield*/, delay(1500)];
            case 6:
                _a.sent();
                output.send(MidiOut.cancelNudgeHiEQ(0));
                return [2 /*return*/, delay(1000)];
        }
    });
}); };
init();

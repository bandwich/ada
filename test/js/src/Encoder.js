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
exports.read = exports.closePorts = exports.puts = exports.runSignalTest = exports.MidiOut = void 0;
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
var MIDISignalsOut = {};
var MIDISignalsIn = {};
exports.MidiOut = {
    delay: function (ms) { return ms; },
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
    nudgeTempo: function (deck, val) { return [0xb5, deck, val]; }
    // add eq kill methods
};
// runs a test of midi signals and checks that they are read by Mixxx
// simulates runtime environment
var runSignalTest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var ps, signals, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ps = (0, exports.puts)();
                signals = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, _runTests(ps.out)];
            case 2:
                signals = _a.sent();
                (0, exports.closePorts)(ps.in, ps.out);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, signals];
        }
    });
}); };
exports.runSignalTest = runSignalTest;
var puts = function () { return _setupConnections(new midi_1.Input(), new midi_1.Output()); };
exports.puts = puts;
var closePorts = function (input, output) {
    input.closePort();
    output.closePort();
};
exports.closePorts = closePorts;
// Separates control flow on message type, outputs message as MIDI (side-effect)
var read = function (output, messages) { return __awaiter(void 0, void 0, void 0, function () {
    var _isDelay, _i, messages_1, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _isDelay = function (m) { return !Array.isArray(m); };
                _i = 0, messages_1 = messages;
                _a.label = 1;
            case 1:
                if (!(_i < messages_1.length)) return [3 /*break*/, 5];
                m = messages_1[_i];
                if (!_isDelay(m)) return [3 /*break*/, 3];
                return [4 /*yield*/, _delay(m)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                _send(output, m);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.read = read;
/* --------------------------------------------------------------------------------- */
// handles side-effects from setup
var _setupConnections = function (input, output) {
    _openPort(input);
    _openPort(output);
    _allowInputRead(input);
    return { in: input, out: output };
};
var _openPort = function (put) { return put.openPort(0); };
var _allowInputRead = function (input) {
    input.on('message', function (deltaTime, message) {
        var status = _statusByte(message).toString();
        MIDISignalsIn[status] = true;
        MIDISignalsOut[status] = true;
    });
};
var _statusByte = function (message) { return message[0]; };
var _delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { setTimeout(resolve, ms); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var _send = function (output, message) {
    var status = _statusByte(message).toString();
    if (MIDISignalsOut[status] === false) {
        throw new Error('MIDI not received by Mixxx');
    }
    output.send(message);
    // set to true on validation from Mixxx
    MIDISignalsOut[status] = false;
};
var _runTests = function (output) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _delay(1000)];
            case 1:
                _a.sent();
                _send(output, exports.MidiOut.selectPlaylist(1));
                return [4 /*yield*/, _delay(2000)];
            case 2:
                _a.sent();
                _send(output, exports.MidiOut.selectTrack(0, 14));
                return [4 /*yield*/, _delay(1000)];
            case 3:
                _a.sent();
                _send(output, exports.MidiOut.play(0, 1));
                return [4 /*yield*/, _delay(1000)];
            case 4:
                _a.sent();
                _send(output, exports.MidiOut.nudgeMasterGain(0, 0));
                return [4 /*yield*/, _delay(1000)];
            case 5:
                _a.sent();
                _send(output, exports.MidiOut.cancelNudgeMasterGain());
                return [4 /*yield*/, _delay(1000)];
            case 6:
                _a.sent();
                _send(output, exports.MidiOut.nudgeMasterGain(0, 1));
                return [4 /*yield*/, _delay(1000)];
            case 7:
                _a.sent();
                _send(output, exports.MidiOut.cancelNudgeMasterGain());
                return [4 /*yield*/, _delay(1000)];
            case 8:
                _a.sent();
                _send(output, exports.MidiOut.nudgeHiEQ(0, 2));
                return [4 /*yield*/, _delay(500)];
            case 9:
                _a.sent();
                _send(output, exports.MidiOut.nudgeHiEQ(0, 3));
                return [4 /*yield*/, _delay(500)];
            case 10:
                _a.sent();
                _send(output, exports.MidiOut.cancelNudgeHiEQ(0));
                return [4 /*yield*/, _delay(1000)];
            case 11:
                _a.sent();
                _send(output, exports.MidiOut.selectTrack(1, 42));
                return [4 /*yield*/, _delay(500)];
            case 12:
                _a.sent();
                return [2 /*return*/, [MIDISignalsOut, MIDISignalsIn]];
        }
    });
}); };

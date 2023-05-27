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
exports.question = exports.action = exports.MidiQ = exports.MidiAction = exports.closePorts = exports.delay = exports.puts = void 0;
var midi_1 = require("@julusian/midi");
var events_1 = require("events");
var puts = function () { return _setupConnections(new midi_1.Input(), new midi_1.Output()); };
exports.puts = puts;
var delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { setTimeout(resolve, ms); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.delay = delay;
var closePorts = function (input, output) {
    input.closePort();
    output.closePort();
};
exports.closePorts = closePorts;
exports.MidiAction = {
    wait: function (ms) { return ms; },
    // 0x8: note off (cancel nudge)
    cancelNudgeMasterGain: function () { return [0x80, 0, 0]; },
    cancelNudgeLevel: function (deck) { return [0x81, deck, 0]; },
    cancelNudgeHiEQ: function (deck) { return [0x82, deck, 0]; },
    cancelNudgeMidEQ: function (deck) { return [0x83, deck, 0]; },
    cancelNudgeLoEQ: function (deck) { return [0x84, deck, 0]; },
    cancelNudgeTempo: function (deck) { return [0x85, deck, 0]; },
    // 0x9: note on (set value)
    selectPlaylist: function (id) { return [0x90, 0, id]; },
    selectTrack: function (deck, id) { return [0x91, deck, id]; },
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
    adjustPosition: function (deck, pos) { return [0x9c, deck, pos]; },
    // 0xb: control change (nudge value)
    nudgeMasterGain: function (size, direction) { return [0xb0, size, direction]; },
    // deck-dependent nudges use val to indicate both direction and size: parity = direction, size = size
    nudgeVolume: function (deck, val) { return [0xb1, deck, val]; },
    nudgeHiEQ: function (deck, val) { return [0xb2, deck, val]; },
    nudgeMidEQ: function (deck, val) { return [0xb3, deck, val]; },
    nudgeLoEQ: function (deck, val) { return [0xb4, deck, val]; },
    nudgeTempo: function (deck, val) { return [0xb5, deck, val]; }
    // add eq kill methods
};
exports.MidiQ = {
    // 0x9: polyphonic pressure (value check)
    gain: function () { return [0xa0, 0, 0]; },
    loaded: function (deck) { return [0xa1, deck, 0]; },
    position: function (deck) { return [0xa2, deck, 0]; },
    volume: function (deck) { return [0xa3, deck, 0]; },
    bpm: function (deck) { return [0xa4, deck, 0]; },
    duration: function (deck) { return [0xa5, deck, 0]; },
};
// Separates control flow on message type, outputs message as MIDI
var action = function (ms) { return function (output) { return __awaiter(void 0, void 0, void 0, function () {
    var _isDelay, _i, ms_1, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _isDelay = function (m) { return !Array.isArray(m); };
                _i = 0, ms_1 = ms;
                _a.label = 1;
            case 1:
                if (!(_i < ms_1.length)) return [3 /*break*/, 5];
                m = ms_1[_i];
                if (!_isDelay(m)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, exports.delay)(m)];
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
}); }; };
exports.action = action;
var question = function (qs) { return function (input, output) { return __awaiter(void 0, void 0, void 0, function () {
    var answers, getAnswer, _i, qs_1, q;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                answers = [];
                getAnswer = function (q) { return __awaiter(void 0, void 0, void 0, function () {
                    var mAnswer, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _send(output, q);
                                return [4 /*yield*/, _waitForAnswer(input)];
                            case 1:
                                mAnswer = _a.sent();
                                result = (_statusByte(q) === _statusByte(mAnswer)) ? _extractVal(mAnswer) : -1;
                                answers.push(result);
                                return [2 /*return*/];
                        }
                    });
                }); };
                _i = 0, qs_1 = qs;
                _a.label = 1;
            case 1:
                if (!(_i < qs_1.length)) return [3 /*break*/, 4];
                q = qs_1[_i];
                return [4 /*yield*/, getAnswer(q)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, answers];
        }
    });
}); }; };
exports.question = question;
/* --------------------------------------------------------------------------------- */
// handles side-effects from setup
var _setupConnections = function (input, output) {
    _openPort(input);
    _openPort(output);
    _allowInputRead(input);
    return { in: input, out: output };
};
var _openPort = function (put) { return put.openPort(0); };
// Emits separate message for Q&A responses
// mutation is ok here - MIDISignals objects will only ever be modified by input.on and _send, and are used for testing
var _allowInputRead = function (input) {
    var _isAnswerMessage = function (byte) { return (0xa0 <= byte && byte <= 0xaf); };
    input.on('message', function (deltaTime, message) {
        var status = _statusByte(message);
        if (_isAnswerMessage(status)) {
            input.emit('answer', message);
        }
    });
};
var _waitForAnswer = function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var reflexive, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, events_1.once)(input, 'answer')];
            case 1:
                reflexive = _a.sent();
                return [4 /*yield*/, (0, events_1.once)(input, 'answer')];
            case 2:
                answer = _a.sent();
                return [2 /*return*/, answer.flat()];
        }
    });
}); };
var _statusByte = function (m) { return m[0]; };
var _extractVal = function (m) { return m[1] + m[2]; };
// signals object param can be used for testing, or to log MIDI signals. 
// can be ignored otherwise, along with return value
var _send = function (output, message) { return output.send(message); };

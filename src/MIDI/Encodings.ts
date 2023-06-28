import { MidiMessage } from "@julusian/midi";
import { Deck, Delay } from "../types/Types";

export const MidiAction = {
    wait: (ms: number): Delay => ms,
    
    // status bytes available for Ada actions: 0x9, 0xa, 0xb: 48 channels
    // Mixxx sends responses with status byte 0x8
    cancelNudgeMasterGain: (): MidiMessage => [0x90, 0, 0],
    cancelNudgeVolume: (deck: Deck): MidiMessage => [0x91, deck, 0],
    cancelNudgeHiEQ: (deck: Deck): MidiMessage => [0x92, deck, 0],
    cancelNudgeMidEQ: (deck: Deck): MidiMessage => [0x93, deck, 0],
    cancelNudgeLoEQ: (deck: Deck): MidiMessage => [0x94, deck, 0],
    cancelNudgeTempo: (deck: Deck): MidiMessage => [0x95, deck, 0],

    nudgeVolume: (deck: Deck, val: number): MidiMessage => [0x96, deck, val],
    nudgeHiEQ: (deck: Deck, val: number): MidiMessage => [0x97, deck, val],
    nudgeMidEQ: (deck: Deck, val: number): MidiMessage => [0x98, deck, val],
    nudgeLoEQ: (deck: Deck, val: number): MidiMessage => [0x99, deck, val],
    nudgeTempo: (deck: Deck, val: number): MidiMessage => [0x9a, deck, val],
    nudgeMasterGain: (size: number, direction: number): MidiMessage => [0x9b, size, direction],

    selectPlaylist: (id: number): MidiMessage => [0xa0, 0, id],
    selectTrack: (deck: Deck, id: number): MidiMessage => [0xa1, deck, id],
    adjustJumpSize: (deck: Deck, size: number): MidiMessage => [0xa2, deck, size],
    jumpForward: (deck: Deck, value: number): MidiMessage => [0xa3, deck, value],
    jumpBackward: (deck: Deck, value: number): MidiMessage => [0xa4, deck, value],
    setTempo: (deck: Deck, val: number): MidiMessage => [0xa5, deck, val],
    adjustLoopLength: (deck: Deck, len: number): MidiMessage => [0xa6, deck, len],
    loop: (deck: Deck, val: number): MidiMessage => [0xa7, deck, val],
    sync: (deck: Deck, val: number): MidiMessage => [0xa8, deck, val],
    play: (deck: Deck, val: number): MidiMessage => [0xa9, deck, val],
    mute: (deck: Deck, val: number): MidiMessage => [0xaa, deck, val],
    activateHotcue: (deck: Deck, num: number): MidiMessage => [0xab, deck, num],
    adjustPosition: (deck: Deck, pos: number): MidiMessage => [0xac, deck, pos],
    setVolume: (deck: Deck, val: number): MidiMessage => [0xad, deck, val]
}

export const MidiQ = {
    gain: (): MidiMessage => [0xb0, 0, 0],
    loaded: (deck: Deck): MidiMessage => [0xb1, deck, 0],
    position: (deck: Deck): MidiMessage => [0xb2, deck, 0],
    volume: (deck: Deck): MidiMessage => [0xb3, deck, 0],
    bpm: (deck: Deck): MidiMessage => [0xb4, deck, 0],
    duration: (deck: Deck): MidiMessage => [0xb5, deck, 0],
}

export const valueAnswerStatus = 0x80
export const timeAnswerStatus = 0x81

export const statusByte = (m: MidiMessage): number => m[0]
export const extractSingleVal = (m: MidiMessage): number => m[1] + m[2]
export const extractTimeVal = (m: MidiMessage): number => (m[1] * 60) + m[2]
export const isAnswerMessage = (byte: number) => (0x80 <= byte && byte <= 0x8f)
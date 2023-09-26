import { MidiMessage } from "@julusian/midi";
import { Deck, Delay } from "../types/Types";

export const MidiAction = {
    wait: (ms: number): Delay => ms,
    
    // status bytes available for Ada actions: 0x9, 0xa: 32 channels
    // Mixxx sends responses with status byte 0x8

    // ANY ACTIONS THAT DON'T NEED BYTE 2 CAN BE STACKED ON ONE CHANNEL! (SOME MASTER ACTIONS)
    moveVertical: (deck: Deck, val: number): MidiMessage => [0x90, deck, val],
    selectTrack: (deck: Deck, id: number): MidiMessage => [0x91, deck, id],
    sync: (deck: Deck, val: number): MidiMessage => [0x92, deck, val],
    loop: (deck: Deck, val: number): MidiMessage => [0x93, deck, val],
    adjustLoopLength: (deck: Deck, len: number): MidiMessage => [0x94, deck, len],
    setVolume: (deck: Deck, val: number): MidiMessage => [0x95, deck, val],
    setHiEQ: (deck: Deck, val: number): MidiMessage => [0x96, deck, val],
    setMidEQ: (deck: Deck, val: number): MidiMessage => [0x97, deck, val],
    setLoEQ: (deck: Deck, val: number): MidiMessage => [0x98, deck, val],
    setFilter: (deck: Deck, val: number): MidiMessage => [0x99, deck, val],
    activateHotcue: (deck: Deck, num: number): MidiMessage => [0x9a, deck, num],
    adjustJumpSize: (deck: Deck, size: number): MidiMessage => [0x9b, deck, size],
    jumpForward: (deck: Deck, value: number): MidiMessage => [0x9c, deck, value],
    jumpBackward: (deck: Deck, value: number): MidiMessage => [0x9d, deck, value],
    setTempo: (deck: Deck, val: number): MidiMessage => [0x9e, deck, val],

    setMasterGain: (val: number): MidiMessage => [0xa0, 0, val],
    setCrossfader: (val: number): MidiMessage => [0xa1, 0, val],
    play: (deck: Deck, val: number): MidiMessage => [0xa4, deck, val],
    
    mute: (deck: Deck, val: number): MidiMessage => [0xaa, deck, val],
    selectPlaylist: (id: number): MidiMessage => [0xab, 0, id],
    adjustPosition: (deck: Deck, pos: number): MidiMessage => [0xac, deck, pos],
}

// Could we instead use sysex (0xF0) status byte for this? The data would look like [[byte array], byte array length]
// The type of the requested value can be encoded within the byte array
// So then Mixxx can send back on 0xb and 0x8

// ALL THIS NEEDS REWRITE !!!!
export const MidiQ = {
    gain: (): MidiMessage => [0xb0, 0, 0],
    loaded: (deck: Deck): MidiMessage => [0xb1, deck, 0],
    position: (deck: Deck): MidiMessage => [0xb2, deck, 0],
    volume: (deck: Deck): MidiMessage => [0xb3, deck, 0],
    bpm: (deck: Deck): MidiMessage => [0xb4, deck, 0],
    duration: (deck: Deck): MidiMessage => [0xb5, deck, 0],
}

export const MidiLabels = (statusByte: number): string => {
    switch(statusByte) {
        case 0x82: return 'beat'
        case 0x83: return 'loopToggle'
        case 0x84: return 'loopSize'
        case 0x85: return 'deckVolume'
        case 0x86: return 'setHighEQ'
        case 0x87: return 'setMidEQ'
        case 0x88: return 'setLoEQ'
        case 0x89: return 'filter'
        case 0x8a: return 'hotcue'
        case 0x8b: return 'jumpSize'
        case 0x8c: return 'jumpForward'
        case 0x8d: return 'jumpBackward'
        case 0x8e: return 'bpm'
        case 0x8f: return 'play'
        default: return 'unknown'
    }
}

export const valueAnswerStatus = 0x80
export const timeAnswerStatus = 0x81

export const extractSingleVal = (m: MidiMessage): number => m[1] + m[2]
export const extractTimeVal = (m: MidiMessage): number => (m[1] * 60) + m[2]

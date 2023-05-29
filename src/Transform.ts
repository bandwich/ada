// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import { Input, MidiMessage, Output } from '@julusian/midi'
import { once } from 'events'

type Ports = {in: Input, out: Output}

type Delay = number
type Message = MidiMessage | Delay
type Answer = number

export type Messages = Message[]
export type Question = MidiMessage

export type Deck = number

export const openPorts = (): Ports => _setupConnections(new Input(), new Output())
export const delay = async (ms: Delay) => {
    return await new Promise((resolve) => { setTimeout(resolve, ms) })
}

export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}

export const MidiAction = {
    wait: (ms: number): Delay => ms,
    
    // available for Ada actions: 0x9, 0xa, 0xb: 48 channels
    // Mixxx sends responses thru 0x8 channels
    cancelNudgeMasterGain: (): MidiMessage => [0x90, 0, 0],
    cancelNudgeLevel: (deck: Deck): MidiMessage => [0x91, deck, 0],
    cancelNudgeHiEQ: (deck: Deck): MidiMessage => [0x92, deck, 0],
    cancelNudgeMidEQ: (deck: Deck): MidiMessage => [0x93, deck, 0],
    cancelNudgeLoEQ: (deck: Deck): MidiMessage => [0x94, deck, 0],
    cancelNudgeTempo: (deck: Deck): MidiMessage => [0x95, deck, 0],

    // deck-dependent nudges use val to indicate both direction and size: parity = direction, size = size
    nudgeVolume: (deck: Deck, val: number): MidiMessage => [0x96, deck, val],
    nudgeHiEQ: (deck: Deck, val: number): MidiMessage => [0x97, deck, val],
    nudgeMidEQ: (deck: Deck, val: number): MidiMessage => [0x98, deck, val],
    nudgeLoEQ: (deck: Deck, val: number): MidiMessage => [0x99, deck, val],
    nudgeTempo: (deck: Deck, val: number): MidiMessage => [0x9a, deck, val],
    nudgeMasterGain: (size: number, direction: number): MidiMessage => [0x9b, size, direction],

    selectPlaylist: (id: number): MidiMessage => [0xa0, 0, id],
    selectTrack: (deck: Deck, id: number): MidiMessage => [0xa1, deck, id], // 1-based index (id)
    adjustJumpSize: (deck: Deck, size: number): MidiMessage => [0xa2, deck, size],
    jumpForward: (deck: Deck, value: number): MidiMessage => [0xa3, deck, value],
    jumpBackward: (deck: Deck, value: number): MidiMessage => [0xa4, deck, value],
    setTempo: (deck: number, val: number): MidiMessage => [0xa5, deck, val],
    adjustLoopLength: (deck: Deck, len: number): MidiMessage => [0xa6, deck, len],
    loop: (deck: Deck, val: number): MidiMessage => [0xa7, deck, val],
    sync: (deck: Deck, val: number): MidiMessage => [0xa8, deck, val],
    play: (deck: Deck, val: number): MidiMessage => [0xa9, deck, val],
    mute: (deck: Deck, val: number): MidiMessage => [0xaa, deck, val],
    activateHotcue: (deck: Deck, num: number): MidiMessage => [0xab, deck, num],
    adjustPosition: (deck: Deck, pos: number): MidiMessage => [0xac, deck, pos]

    // add eq kill methods
}

export const MidiQ = {
    // 0xb: polyphonic pressure (value check)
    gain: (): MidiMessage => [0xb0, 0, 0],
    loaded: (deck: Deck): MidiMessage => [0xb1, deck, 0],
    position: (deck: Deck): MidiMessage => [0xb2, deck, 0],
    volume: (deck: Deck): MidiMessage => [0xb3, deck, 0],
    bpm: (deck: Deck): MidiMessage => [0xb4, deck, 0],
    duration: (deck: Deck): MidiMessage => [0xb5, deck, 0],
}

// Separates control flow on message type, outputs message as MIDI
export const action = (ms: Messages) => async (output: Output): Promise<void> => {
    const _isDelay = (m: Message) => !Array.isArray(m)
    for (let m of ms) {
        if (_isDelay(m)) await delay(m as Delay)
        else _send(output, m as MidiMessage)
    }
}

export const question = (q: Question) => async (input: Input, output: Output): Promise<Answer> => {
    _send(output, q)
    const answer = await _waitForAnswer(input) as MidiMessage
    
    const isValue = _statusByte(answer) === valueAnswerByte
    const isTime = _statusByte(answer) === timeAnswerByte

    if (isValue) return _extractSingleVal(answer)
    else if (isTime) return _extractTimeVal(answer)
    else return -1
}

/* --------------------------------------------------------------------------------- */

// handles side-effects from setup
const _setupConnections = (input: Input, output: Output): Ports => {
    _openPort(input)
    _openPort(output)
    _listenForInputs(input)
    return {in: input, out: output}
}

const _openPort = (put: Input | Output): void => put.openPort(0)

// Emits separate message for Q&A responses
const _listenForInputs = (input: Input): void => {
    const _isAnswerMessage = (byte: number) => (0xb0 <= byte && byte <= 0xbf)
    input.on('message', (deltaTime, message) => {
        const status = _statusByte(message)
        if (_isAnswerMessage(status)) {
            input.emit('answer', message)
        }
    })
}

const _waitForAnswer = async (input: Input): Promise<unknown> => {
    const answer = await once(input, 'answer')
    return answer.flat()
}

const valueAnswerByte = 0xb0
const timeAnswerByte = 0xb1
const _statusByte = (m: MidiMessage): number => m[0]
const _extractSingleVal = (m: MidiMessage): number => m[1] + m[2]
const _extractTimeVal = (m: MidiMessage): number => (m[1] * 60) + m[2]

const _send = (output: Output, message: MidiMessage) => output.send(message)
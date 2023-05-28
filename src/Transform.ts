// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import { Input, MidiMessage, Output } from '@julusian/midi'
import { once } from 'events'

type Ports = {in: Input, out: Output}

type Delay = number
type Message = MidiMessage | Delay
type Question = MidiMessage
type Answer = number

export type Messages = Message[]
export type Questions = Question[]
export type Answers = Answer[]

type Deck = number

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
    
    // 0x8: nudges and cancel nudges
    cancelNudgeMasterGain: (): MidiMessage => [0x80, 0, 0],
    cancelNudgeLevel: (deck: Deck): MidiMessage => [0x81, deck, 0],
    cancelNudgeHiEQ: (deck: Deck): MidiMessage => [0x82, deck, 0],
    cancelNudgeMidEQ: (deck: Deck): MidiMessage => [0x83, deck, 0],
    cancelNudgeLoEQ: (deck: Deck): MidiMessage => [0x84, deck, 0],
    cancelNudgeTempo: (deck: Deck): MidiMessage => [0x85, deck, 0],

    // deck-dependent nudges use val to indicate both direction and size: parity = direction, size = size
    nudgeVolume: (deck: Deck, val: number): MidiMessage => [0x86, deck, val],
    nudgeHiEQ: (deck: Deck, val: number): MidiMessage => [0x87, deck, val],
    nudgeMidEQ: (deck: Deck, val: number): MidiMessage => [0x88, deck, val],
    nudgeLoEQ: (deck: Deck, val: number): MidiMessage => [0x89, deck, val],
    nudgeTempo: (deck: Deck, val: number): MidiMessage => [0x8a, deck, val],
    nudgeMasterGain: (size: number, direction: number): MidiMessage => [0x8b, size, direction],

    // 0x9: set value
    selectPlaylist: (id: number): MidiMessage => [0x90, 0, id],
    selectTrack: (deck: Deck, id: number): MidiMessage => [0x91, deck, id], // 1-based index (id)
    adjustJumpSize: (deck: Deck, size: number): MidiMessage => [0x92, deck, size],
    jumpForward: (deck: Deck, value: number): MidiMessage => [0x93, deck, value],
    jumpBackward: (deck: Deck, value: number): MidiMessage => [0x94, deck, value],
    setTempo: (deck: number, val: number): MidiMessage => [0x95, deck, val],
    adjustLoopLength: (deck: Deck, len: number): MidiMessage => [0x96, deck, len],
    loop: (deck: Deck, val: number): MidiMessage => [0x97, deck, val],
    sync: (deck: Deck, val: number): MidiMessage => [0x98, deck, val],
    play: (deck: Deck, val: number): MidiMessage => [0x99, deck, val],
    mute: (deck: Deck, val: number): MidiMessage => [0x9a, deck, val],
    activateHotcue: (deck: Deck, num: number): MidiMessage => [0x9b, deck, num],
    adjustPosition: (deck: Deck, pos: number): MidiMessage => [0x9c, deck, pos],

    // add eq kill methods
}

export const MidiQ = {
    // 0x9: polyphonic pressure (value check)
    gain: (): MidiMessage => [0xa0, 0, 0],
    loaded: (deck: Deck): MidiMessage => [0xa1, deck, 0],
    position: (deck: Deck): MidiMessage => [0xa2, deck, 0],
    volume: (deck: Deck): MidiMessage => [0xa3, deck, 0],
    bpm: (deck: Deck): MidiMessage => [0xa4, deck, 0],
    duration: (deck: Deck): MidiMessage => [0xa5, deck, 0],
}

// Separates control flow on message type, outputs message as MIDI
export const action = (ms: Messages) => async (output: Output): Promise<void> => {
    const _isDelay = (m: Message) => !Array.isArray(m)
    for (let m of ms) {
        if (_isDelay(m)) await delay(m as Delay)
        else _send(output, m as MidiMessage)
    }
}

export const question = (qs: Questions) => async (input: Input, output: Output): Promise<Answers> => {
    // imperative style here for ease with async call+response behavior - icky but should hold
    let answers: Answers = []
    const pushAnswer = async (q: Question) => {
        _send(output, q)
        const answer = await _waitForAnswer(input) as MidiMessage
        const isValue = _statusByte(answer) === valueAnswerByte
        const isTime = _statusByte(answer) === timeAnswerByte

        if (isValue) answers.push(_extractSingleVal(answer))
        else if (isTime) answers.push(_extractTimeVal(answer))
        else answers.push(-1)
    }
    for (let q of qs) await pushAnswer(q)
    return answers
}

/* --------------------------------------------------------------------------------- */

// handles side-effects from setup
const _setupConnections = (input: Input, output: Output): Ports => {
    _openPort(input)
    _openPort(output)
    _allowInputRead(input)
    return {in: input, out: output}
}

const _openPort = (put: Input | Output): void => put.openPort(0)

// Emits separate message for Q&A responses
// mutation is ok here - MIDISignals objects will only ever be modified by input.on and _send, and are used for testing
const _allowInputRead = (input: Input): void => {
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

// signals object param can be used for testing, or to log MIDI signals. 
// can be ignored otherwise, along with return value
const _send = (output: Output, message: MidiMessage) => output.send(message)
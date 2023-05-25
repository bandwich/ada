// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

/* Actions --------------------------------------------------- 

    Controllers are invoked by the controller change status byte (1011nnnn) followed by the controller number (0-127) followed 
    by the controller value.
    
    Older conventions of switch values, such as any data value over 0 = 'ON,' or recognizing only 0 = 'OFF' and 127 = 'ON' 
    and ignoring the rest, have been replaced by the convention 0-63 = 'ON' and 64-127 = 'OFF.'

    Data pipeline, top-down: Ada -> mode -> track selection -> transition (group of actions) -> action (midi signal)

    status byte (opcode + channel), controller number, controller value
    XML file matches on status and midino (controller number) - bytes 1 and 2
*/

import { Input, MidiMessage, Output } from '@julusian/midi'

interface MIDISignals { [key: string]: boolean }
type Puts = {in: Input, out: Output}

const MIDISignalsOut: MIDISignals = {}
const MIDISignalsIn: MIDISignals = {}

type Delay = number
type Message = MidiMessage | Delay

export type Messages = Message[]
export const MidiOut = {
    delay: (ms: number): Delay => ms,
    
    cancelNudgeMasterGain: (): MidiMessage => [0x80, 0, 0],
    cancelNudgeLevel: (deck: number): MidiMessage => [0x81, deck, 0],
    cancelNudgeHiEQ: (deck: number): MidiMessage => [0x82, deck, 0],
    cancelNudgeMidEQ: (deck: number): MidiMessage => [0x83, deck, 0],
    cancelNudgeLoEQ: (deck: number): MidiMessage => [0x84, deck, 0],
    cancelNudgeTempo: (deck: number): MidiMessage => [0x85, deck, 0],

    selectPlaylist: (id: number): MidiMessage => [0x90, 0, id],
    selectTrack: (deck: number, pos: number): MidiMessage => [0x91, deck, pos],
    adjustJumpSize: (deck: number, size: number): MidiMessage => [0x92, deck, size],
    jumpForward: (deck: number, value: number): MidiMessage => [0x93, deck, value],
    jumpBackward: (deck: number, value: number): MidiMessage => [0x94, deck, value],
    setTempo: (deck: number, val: number): MidiMessage => [0x95, deck, val],
    adjustLoopLength: (deck: number, len: number): MidiMessage => [0x96, deck, len],
    loop: (deck: number, val: number): MidiMessage => [0x97, deck, val],
    sync: (deck: number, val: number): MidiMessage => [0x98, deck, val],
    play: (deck: number, val: number): MidiMessage => [0x99, deck, val],
    mute: (deck: number, val: number): MidiMessage => [0x9a, deck, val],
    activateHotcue: (deck: number, num: number): MidiMessage => [0x9b, deck, num],

    nudgeMasterGain: (size: number, direction: number): MidiMessage => [0xb0, size, direction],
    
    // deck-dependent nudges use val to indicate both direction and size: parity = direction, size = size
    nudgeVolume: (deck: number, val: number): MidiMessage => [0xb1, deck, val],
    nudgeHiEQ: (deck: number, val: number): MidiMessage => [0xb2, deck, val],
    nudgeMidEQ: (deck: number, val: number): MidiMessage => [0xb3, deck, val],
    nudgeLoEQ: (deck: number, val: number): MidiMessage => [0xb4, deck, val],
    nudgeTempo: (deck: number, val: number): MidiMessage => [0xb5, deck, val]

    // add eq kill methods
}

// runs a test of midi signals and checks that they are read by Mixxx
// simulates runtime environment
export const runSignalTest = async (): Promise<MIDISignals[]> => {
    const ps = puts()
    let signals: MIDISignals[] = []
    try {
        signals = await _runTests(ps.out)
        closePorts(ps.in, ps.out)
    } catch (e) {
        console.log(e)
    }
    return signals
}

export const puts = (): Puts => _setupConnections(new Input(), new Output())

export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}

// Separates control flow on message type, outputs message as MIDI (side-effect)
export const read = async (output: Output, messages: Messages): Promise<void> => {
    const _isDelay = (m: Message) => !Array.isArray(m)
    for (let m of messages) {
        if (_isDelay(m)) await _delay(m as Delay)
        else _send(output, m as MidiMessage)
    }
}

/* --------------------------------------------------------------------------------- */

// handles side-effects from setup
const _setupConnections = (input: Input, output: Output): Puts => {
    _openPort(input)
    _openPort(output)
    _allowInputRead(input)
    return {in: input, out: output}
}

const _openPort = (put: Input | Output): void => put.openPort(0)
const _allowInputRead = (input: Input): void => {
    input.on('message', (deltaTime, message) => {
        const status = _statusByte(message).toString()
        MIDISignalsIn[status] = true
        MIDISignalsOut[status] = true
    })
}

const _statusByte = (message: MidiMessage): number => message[0]
const _delay = async (ms: number) => {
    return await new Promise((resolve) => { setTimeout(resolve, ms) })
}

const _send = (output: Output, message: MidiMessage) => {
    const status = _statusByte(message).toString()
    if (MIDISignalsOut[status] === false) {
        throw new Error('MIDI not received by Mixxx')
    }
    output.send(message)
    // set to true on validation from Mixxx
    MIDISignalsOut[status] = false
}

const _runTests = async (output: Output): Promise<MIDISignals[]> => {
    await _delay(1000)
    _send(output, MidiOut.selectPlaylist(1))

    await _delay(2000)
    _send(output, MidiOut.selectTrack(0, 14))

    await _delay(1000)
    _send(output, MidiOut.play(0, 1))
    
    await _delay(1000)
    _send(output, MidiOut.nudgeMasterGain(0, 0))

    await _delay(1000)
    _send(output, MidiOut.cancelNudgeMasterGain())

    await _delay(1000)
    _send(output, MidiOut.nudgeMasterGain(0, 1))

    await _delay(1000)
    _send(output, MidiOut.cancelNudgeMasterGain())

    await _delay(1000)
    _send(output, MidiOut.nudgeHiEQ(0, 2))

    await _delay(500)
    _send(output, MidiOut.nudgeHiEQ(0, 3))

    await _delay(500)
    _send(output, MidiOut.cancelNudgeHiEQ(0))

    await _delay(1000)
    _send(output, MidiOut.selectTrack(1, 42))

    await _delay(500)
    return [MIDISignalsOut, MIDISignalsIn]
}
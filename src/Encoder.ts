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
const ActiveMIDISignals: MIDISignals = {}

const MidiOut = {
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

const _statusByte = (message: MidiMessage) => {
    return message[0]
}

const setupConnections = (input: Input, output: Output) => {
    input.openPort(0)
    input.on('message', (deltaTime, message) => {
        const status = _statusByte(message).toString()
        ActiveMIDISignals[status] = false
    })
    output.openPort(0)
}

const closePorts = (input: Input, output: Output) => {
    input.closePort()
    output.closePort()
}

export const init = async (): Promise<MIDISignals> => {
    const vIn = new Input()
    const vOut = new Output()
    setupConnections(vIn, vOut)
    try {
        await tests(vOut)
        closePorts(vIn, vOut)
        return ActiveMIDISignals
    } catch (e) {
        console.log(e)
    }
    return ActiveMIDISignals
}

const send = (output: Output, message: MidiMessage) => {
    const status = _statusByte(message).toString()
    if (ActiveMIDISignals[status] === true) {
        throw new Error('MIDI not received by Mixxx')
    }
    output.send(message)
    ActiveMIDISignals[status] = true
}

const delay = async (ms: number) => {
    return await new Promise((resolve) => { setTimeout(resolve, ms) })
}

const tests = async (output: Output): Promise<unknown> => {
    await delay(1000)
    send(output, MidiOut.selectPlaylist(1))

    await delay(2000)
    send(output, MidiOut.selectTrack(0, 14))

    await delay(1000)
    send(output, MidiOut.play(0, 1))
    
    await delay(1000)
    send(output, MidiOut.nudgeMasterGain(0, 0))

    await delay(1000)
    send(output, MidiOut.cancelNudgeMasterGain())

    await delay(1000)
    send(output, MidiOut.nudgeMasterGain(0, 1))

    await delay(1000)
    send(output, MidiOut.cancelNudgeMasterGain())

    await delay(1000)
    send(output, MidiOut.nudgeHiEQ(0, 2))

    await delay(1000)
    send(output, MidiOut.nudgeHiEQ(0, 3))

    await delay(1000)
    send(output, MidiOut.cancelNudgeHiEQ(0))

    await delay(2000)
    return delay(0)
}
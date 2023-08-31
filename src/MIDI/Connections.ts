// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import "dotenv/config.js"
import { Input, MidiMessage, Output } from '@julusian/midi'
import { Port, Ports } from '../types/Types'
import { isMixxxMessage, statusByte } from './Encodings'
import { addMidiEvent } from '../data'

const _setupConnections = (input: Input, output: Output) => {
    // handles side-effects from connection setup
    return (inPort: number, outPort: number): Ports => {
        _openPort(input, inPort)
        _openPort(output, outPort)
        _listenForInputs(input)
        return {in: input, out: output}
    }
}

const _openPort = (put: Port, portNumber: number): void => put.openPort(portNumber)

// Emits separate message for Q&A responses
const _listenForInputs = (input: Input) => {
    input.on('message', async (deltaTime, message) => {
        const status = statusByte(message)
        if (isMixxxMessage(status)) {
            await addMidiEvent(message, performance.now())
            console.log([...message, performance.now()])
        }
    })
}

export const getPorts = (portType: Port) => {
    const count = portType.getPortCount()
    const portName = (v: any, x: number) => portType.getPortName(x)
    return Array(count).fill('').map(portName)
}

// _setupConnections is curried and returns func accepting port numbers
export const openPorts = () => _setupConnections(new Input(), new Output())
export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}
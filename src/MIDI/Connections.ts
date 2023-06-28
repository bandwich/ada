// https://github.com/julusian/node-midi
// https://cmtext.indiana.edu/MIDI/chapter3_controller_change.php

import { Input, Output } from '@julusian/midi'
import { Port, Ports } from '../types/Types'
import { isAnswerMessage, statusByte } from './Encodings'

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
const _listenForInputs = (input: Input): void => {
    input.on('message', (deltaTime, message) => {
        const status = statusByte(message)
        if (isAnswerMessage(status)) {
            input.emit('answer', message)
        }
    })
}

export const getPorts = (portType: Port) => {
    let names = []
    for (let x = 0; x < portType.getPortCount(); x++) {
        names.push(portType.getPortName(x))
    }
    return names
}

// _setupConnections is curried and returns func accepting port numbers
export const openPorts = () => _setupConnections(new Input(), new Output())
export const closePorts = (input: Input, output: Output): void => {
    input.closePort()
    output.closePort()
}